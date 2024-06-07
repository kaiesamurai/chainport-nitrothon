const Footer = () => {
  return (
    <div className="absolute w-full border-t border-gray-200 bg-white py-5 text-center">
      <p className="text-gray-500">
        Built using{" "}
        <a
          className="font-medium text-red-700 underline transition-colors"
          href="https://www.routerprotocol.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Router Protocol
        </a>
      </p>
    </div>
  );
}

export default Footer;