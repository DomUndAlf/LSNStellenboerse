import * as React from "react";

function Footer() {
  const CONTACTEMAIL: string = "lsn.job.approval@gmail.com";

  return (
    <footer className="bg-gray-200 text-center py-4">
      <p className="text-gray-600">
        Um Änderungen an den Informationen Ihrer Stellenanzeige vorzunehmen, können Sie jederzeit
        den Ihnen zugesandten Link erneut aufrufen.
      </p>
      <p className="text-gray-600">
        Bei weiteren Fragen stehen wir Ihnen gerne zur Verfügung unter:{" "}
        <a href={`mailto:${CONTACTEMAIL}`}>{CONTACTEMAIL}</a>
      </p>
    </footer>
  );
}

export default Footer;
