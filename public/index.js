$(document).ready(function () {
  try {
    window.ethereum.enable();
  } catch (e) {
    alert("Access Denied.");
  }

  const documentRegistryContractAddress = "";

  const documentRegistryContractABI = [];

  const IPFS = window.IpfsApi("localhost", "5001");
  const Buffer = IPFS.Buffer;

  // === User Interface Handlers Start ===

  $("#linkHome").click(function () {
    showView("viewHome");
  });

  $("#linkSubmitDocument").click(function () {
    showView("viewSubmitDocument");
  });

  $("#linkGetDocuments").click(function () {
    $("#viewGetDocuments div").remove();
    showView("viewGetDocuments");
    viewGetDocuments();
  });

  // Attach AJAX "loading" event listener
  $(document).on({
    ajaxStart: function () {
      $("#loadingBox").show();
    },
    ajaxStop: function () {
      $("#loadingBox").hide();
    }
  });

  function showView(viewName) {
    // Hide all views and show the selected view only
    $("main > section").hide();
    $("#" + viewName).show();
  }

  function showInfo(message) {
    $("#infoBox>p").html(message);
    $("#infoBox").show();
    $("#infoBox>header").click(function () {
      $("#infoBox").hide();
    });
  }

  function showError(errorMsg) {
    $("#errorBox>p").html("Error: " + errorMsg);
    $("#errorBox").show();
    $("#errorBox>header").click(function () {
      $("#errorBox").hide();
    });
  }

  $("#documentUploadButton").click(uploadDocument);

  // === User Interface Interactions End ===

  function uploadDocument() {
    // Todo: Implementation
    if ($('#documentForUpload')[0].files.length === 0) {
      showError("Please select file to upload!");
      return;
    }

    let fileReader = new FileReader();
    fileReader.onload = async function () {
      // TODO: Handler
      if (typeof web3 === "undefined") {
        showError(
          "Please install Metamask to access the Ethereum Web3 API from your browser."
        );
        return;
      }

      let fileBuffer = Buffer.from(fileReader.result);
      let contract = web3.eth 
        .contract(documentRegistryContractABI)
        .at(documentRegistryContractAddress);

      IPFS.files.add(fileBuffer,(err,result) => {
        if (err) {
          showError(err);
          return;
        }

        if (result) {
          let ipfsHash = result[0].hash;
          contract.add(ipfsHash, (error, txHash) => {
            if (error) {
              showError("Smart contract calle failed: " + error);
              return;
            }

            if (txHash) {
              showInfo(
                `Document ${ipfsHash} successfully added to the registry! Transaction hash: ${txHash}`
              );
              return;
            }
          });
        }
      });
    };

    fileReader.readAsArrayBuffer($('#documentForUpload')[0].files[0]);
  }

  function viewGetDocuments() {
    // Todo: Implementation
    if (typeof web3 === "undefined") {
      showError(
        "Please install Metamask to access the Ethereum Web3 API from your web browser."
      );
      return;
    }
    // Implement
    let contract = web3.eth
      .contract(documentRegistryContractABI)
      .at(documentRegistryContractAddress);

    contract.getDocumentCount((err, res) => {
      if (err) {
        showError("Smart contract failed: " + err);
        return;
      }

      let documentsCount = res.toNumber();

      if (documentsCount > 0) {
        let html = $("div");
        for (let index = 0; index < documentsCount; index++) {
          contract.getDocument(index, (error, result) => {
            if (error) {
              showError("Smart contract failed: " + error);
              return;
            }
            let ipfsHash = result[0];
            let contractPublishDate = result[1];
            let div = $("<div");
            let url = "http://localhost:8080/ipfs/" + ipfsHash;

            let displayDate = new Date(
              contractPublishDate * 1000
            ).toLocaleDateString();
            div.append($(`<p>Document published on: ${displayDate}</p>`));
            div.append(`<img src="${url}" />`);
            html.append(div);
          });
        }
        html.append("</div>");
        $("#viewGetDocuments").append(html);
      } else {
        $("#viewGetDocments").append("<div>No documents in the document registry!</div>");
      }
    });
  }
});
