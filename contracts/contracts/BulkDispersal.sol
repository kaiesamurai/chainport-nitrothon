// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "@routerprotocol/evm-gateway-contracts/contracts/IDapp.sol";
import "@routerprotocol/evm-gateway-contracts/contracts/IGateway.sol";
import "@routerprotocol/evm-gateway-contracts/contracts/Utils.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BulkDispersal is ERC20, IDapp {
  using SafeERC20 for ERC20;

  // address of the owner
  address public owner;

  // address of the gateway contract
  IGateway public gatewayContract;

  // gas limit required to handle cross-chain request on the destination chain
  uint64 public _destGasLimit;

  // chain id => address of our contract
  mapping(string => string) public ourContractOnChains;

  struct TransferDetails {
    string destChainId;
    address[] recipients;
    uint256[] amounts;
  }

  constructor(
    address payable gatewayAddress,
    string memory feePayerAddress
  ) ERC20("Bulk", "BLKT2") {
    gatewayContract = IGateway(gatewayAddress);
    owner = msg.sender;
    _mint(msg.sender, 50000000000000000000);
    gatewayContract.setDappMetadata(feePayerAddress);
  }

  /// @notice function to set the fee payer address on Router Chain.
  /// @param feePayerAddress address of the fee payer on Router Chain.
  function setDappMetadata(string memory feePayerAddress) external {
    require(msg.sender == owner, "only owner");
    gatewayContract.setDappMetadata(feePayerAddress);
  }

  /// @notice function to set the Router Gateway Contract.
  /// @param gateway address of the gateway contract.
  function setGateway(address gateway) external {
    require(msg.sender == owner, "only owner");
    gatewayContract = IGateway(gateway);
  }

  function mint(address account, uint256 amount) external {
    _mint(account, amount);
  }

  /// @notice function to set the address of our ERC20 contracts on different chains.
  /// This will help in access control when a cross-chain request is received.
  /// @param chainIds array of chain Ids of the destination chains in string.
  /// @param contractAddresses array of addresses of the ERC20 contracts on the destination chains.
  function setContractOnChain(string[] memory chainIds, string[] memory contractAddresses) external {
    require(msg.sender == owner, "only owner");
    require(chainIds.length == contractAddresses.length, "chainIds and contractAddresses arrays length mismatch");

    for (uint256 i = 0; i < chainIds.length; i++) {
      ourContractOnChains[chainIds[i]] = contractAddresses[i];
    }
  }

  function transferBulkCrossChain(TransferDetails[] calldata transfers, bytes calldata requestMetadata) public payable {
    for (uint256 i = 0; i < transfers.length; i++) {
      TransferDetails calldata transfer = transfers[i];

      require(
        keccak256(bytes(ourContractOnChains[transfer.destChainId])) !=
          keccak256(bytes("")),
        "contract on dest not set"
      );

      require(
        transfer.recipients.length == transfer.amounts.length,
        "recipients and amounts arrays length mismatch"
      );

      require(
        balanceOf(msg.sender) >= getTotalAmount(transfer.amounts),
        "ERC20: Total amount cannot be greater than the balance"
      );

      // Burning the tokens from the address of the user calling this function
      _burn(msg.sender, getTotalAmount(transfer.amounts));

      bytes memory packet = abi.encode(transfer.recipients, transfer.amounts);

      bytes memory requestPacket = abi.encode(
        ourContractOnChains[transfer.destChainId],
        packet
      );

      gatewayContract.iSend{ value: msg.value }(
        1,
        0,
        string(""),
        transfer.destChainId,
        requestMetadata,
        requestPacket
      );
    }
  }

  function getTotalAmount(uint256[] calldata amounts) internal pure returns (uint256) {
    uint256 totalAmount = 0;
    for (uint256 i = 0; i < amounts.length; i++) {
      totalAmount += amounts[i];
    }
    return totalAmount;
  }

  function iReceive(string memory requestSender, bytes memory packet, string memory srcChainId) external override returns (bytes memory) {
    require(msg.sender == address(gatewayContract), "only gateway");
    require(
      keccak256(bytes(ourContractOnChains[srcChainId])) ==
        keccak256(bytes(requestSender))
    );

    (address[] memory recipients, uint256[] memory amounts) = abi.decode(
      packet,
      (address[], uint256[])
    );

    require(
      recipients.length == amounts.length,
      "recipients and amounts arrays length mismatch"
    );

    for (uint256 i = 0; i < recipients.length; i++) {
      _mint(recipients[i], amounts[i]);
    }

    return abi.encode(srcChainId);
  }

  function iAck(uint256 requestIdentifier, bool execFlag, bytes memory execData) external override {}

  function toBytes(address a) public pure returns (bytes memory b) {
    assembly {
      let m := mload(0x40)
      a := and(a, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
      mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
      mstore(0x40, add(m, 52))
      b := m
    }
  }

  function toAddress(bytes memory _bytes) internal pure returns (address addr) {
    bytes20 srcTokenAddress;
    assembly {
      srcTokenAddress := mload(add(_bytes, 0x20))
    }
    addr = address(srcTokenAddress);
  }
}
