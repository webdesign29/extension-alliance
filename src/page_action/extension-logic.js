
jQuery(document).ready(function($){
	
	$('.extension-popup').on('click', '.extract-fiche', function(){
		//doExtract();
		
		// Send message from active tab to background: 
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		  chrome.tabs.sendMessage(tabs[0].id, 'getHTML', function(response) {
		    doExtract(response);
		  });
		});
	
	})

});






function loadFile(url,callback){
    JSZipUtils.getBinaryContent(url,callback);
}
function doExtract(response) {

	console.log('Le dfgfdscontenu de la page est', $(response).find('H1'))

	loadFile("modele_assurprox.docx",function(error,content){
	    if (error) { throw error };
	    var zip = new JSZip(content);
	    var doc = new Docxtemplater().loadZip(zip)
	    doc.setData({
	        first_name: $(response).find('H1').first(),
	        last_name: 'Pilipe',
	        phone: '0652455478',
	        description: 'New Website'
	    });

	    try {
	        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
	        doc.render()
	    }
	    catch (error) {
	        var e = {
	            message: error.message,
	            name: error.name,
	            stack: error.stack,
	            properties: error.properties,
	        }
	        console.log(JSON.stringify({error: e}));
	        // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
	        throw error;
	    }

	    var out=doc.getZip().generate({
	        type:"blob",
	        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	    }) //Output the document using Data-URI
	    saveAs(out,"output.docx")
	})

}