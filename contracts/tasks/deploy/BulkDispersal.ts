import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("TASK_DEPLOY_BULK_DISPERSAL").setAction(async function (
  _taskArguments: TaskArguments,
  hre
) {
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;

  const deployments = require("../../deployment/deployments.json");

  const gatewayContract = deployments[chainId].gatewayContract;
  const feePayerAddress = deployments[chainId].feePayerAddress;

  const deployContract = "BulkDispersal";

  console.log("Contract Deployment Started ");
  const BulkTransfer = await hre.ethers.getContractFactory("BulkDispersal");
  const bulkTransfer = await BulkTransfer.deploy(
    gatewayContract,
    feePayerAddress
  );
  await bulkTransfer.deployed();

  console.log(deployContract + " Contract deployed to: ", bulkTransfer.address);
  console.log("Contract Deployment Ended");

  await hre.run("TASK_STORE_DEPLOYMENTS", {
    contractName: deployContract,
    contractAddress: bulkTransfer.address,
    chainID: chainId.toString(),
  });
  return null;
});
