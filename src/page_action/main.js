var Promise = XlsxPopulate.Promise;

jQuery(document).ready(function($) {

    $('.extension-popup').on('click', '.extract-fiche-docx', function() {
        // Send message from active tab to background: 
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'getHTML', function(response) {
                doExtractDoc(response.result);
            });
        });
    });

    $('.extension-popup').on('click', '.extract-fiche-xlsx', function() {
        // Send message from active tab to background: 
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'getHTML', function(response) {
                doExtractXLS(response.result);
            });
        });
    })

});

function loadFile(url, callback) {
    JSZipUtils.getBinaryContent(url, callback);
}


function doExtractXLS(response) {

    var parsedData = getParsedData(response);

    loadFile("modele_assurprox.xlsx", function(error, content) {
        if (error) { throw error };
        //var zip = new JSZip(content);
        var xlsx = XlsxPopulate.fromDataAsync(content)
            .then(function(workbook) {
                workbook.sheet(0).cell("A2").value(parsedData.first_name).style("fontColor", "000");
                return workbook.outputAsync("Blob");
            }).then(function(blob) {
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, "out.xlsx");
                } else {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "out.xlsx";
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            });
    });
}

function getWorkbook() {
    return XlsxPopulate.fromBlankAsync();
}

function generate() {
    return getWorkbook()
        .then(function(workbook) {
            workbook.sheet(0).cell("A1").value("This was created in the browser!").style("fontColor", "ff0000");
            return workbook.outputAsync(type);
        })
}

function generateBlob() {
    return generate()
        .then(function(blob) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, "out.xlsx");
            } else {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = url;
                a.download = "out.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        })
        .catch(function(err) {
            alert(err.message || err);
            throw err;
        });
}

function getParsedData(response) {
    return {
        first_name: $(response).find('H1').html() ? $(response).find('H1').html() : '',
        last_name: $(response).find('H1').html() ? $(response).find('H1').html() : '',
        phone: $(response).find('H1').html() ? $(response).find('H1').html() : '',
        description: $(response).find('H1').html() ? $(response).find('H1').html() : ''
    }
}

function doExtractDoc(response) {

    var parsedData = getParsedData(response);

    loadFile("modele_assurprox.docx", function(error, content) {
        if (error) { throw error };
        var zip = new JSZip(content);
        var doc = new Docxtemplater().loadZip(zip)
        doc.setData({
            first_name: parsedData.first_name,
            last_name: parsedData.last_name,
            phone: parsedData.phone,
            description: parsedData.description
        });

        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        } catch (error) {
            var e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            }
            console.log(JSON.stringify({ error: e }));
            // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
            throw error;
        }

        var out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }) //Output the document using Data-URI
        saveAs(out, "output.docx")
    });

}