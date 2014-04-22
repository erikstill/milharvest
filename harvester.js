// Credit for harvester.js goes to Doug Eriksen at Seattle University, who created the concept and original JavaScript
// See https://github.com/eriksend/milharvest

// Notes:
// There are 2 approaches used below to identify the bib data fields:
// 1) Look for a Matching label name (e.g., "ISBN").  The label name is defined in webpub.def
// 2) Look for a "flag" in the label name that denotes the MARC tag # (e.g., label260).  This flag is created in webpub.def
// Both approaches work the same way.  #1 was the original mechanism used in harvester.  I developed #2 after using harvester for a while.

var label_ISBN="ISBN";
var label_ISSN="ISSN";
var label_title="Title";
var label_ResourceName="ResourceName"; // requires a no-whitespace version for comparison
var label_GeneralNote="General Note";
var label_SecurityLevel="Security Level";
var label_ContactInformation="Contact Information";
// var label_author="Author";   // Unused.  Use Mtype flag instead
var label_LCCN="LCCN";
var label_OCLC="Record #";

// You can keep the script from parsing every table in your page by telling it here the ID of the div that contains your recordinfo tokens (e.g., id="harvestHere").
// Set to "0" if you want to scan the whole page.
var label_tableContainer="harvestHere";
// var label_tableContainer="0";

// preset global variables and make them available to other script
var exist_ISBN = "0"; // exist variables will be used to track whether a particular piece of data has been found and harvested
var bib_ISBN="0"; //  bib variable will hold the data

var exist_ISSN = "0"; 
var bib_ISSN="0";

var exist_title="0";
var bib_title="0";

var erm_rname="";

var exist_author="0";
var bib_author="0";

var exist_LCCN="0";
var bib_LCCN="0";

var exist_OCLC="0";
var bib_OCLC="0";

var bib_genNote="";

var bib_secLevel="";

var bib_conInfo="";

var harvest_run="0";

var labelHTML="";
var labelMARC="";

var data260="";
var data261="";
var data914="";
var data915="";
var data916="";
var data917="";
var data918="";
var data920="";
var data925="";
var data926="";
var data928="";
var data932="";
var data933="";
var data936="";
var data937="";
var data938="";
var data536="";     
var data100="";  
var data110="";
var data111="";
var data700="";  
var data710="";
var data711="";

function milHarvest(){

var container;
var tr;
var x;
var i;

function scrapeLoop(data){    // this version removes tags
			if (data.length==0) 	{ // Finds the first instance of the data field
			data = x[1].innerHTML.replace(/(<([^>]+)>)/ig,"");		// get the data from this first instance, and strip all tags
			}
			else { // Finds additional instances of data from this field that do NOT immediately follow the first instance in MilCat
			data = data + "<div class=\"minispacer\"></div>" + x[1].innerHTML.replace(/(<([^>]+)>)/ig,"");		// get the additional instances, append to initial one, and strip all tags
			}
			var j = 1;
			while ((tr[i+j]!=null) && (tr[i+j].getElementsByTagName('TD')[0].innerHTML == "")) { // Finds additional data fields through the blank TD that immediately follow the first instance TD
					data = data + "<div class=\"minispacer\"></div>" + tr[i+j].getElementsByTagName('TD')[1].innerHTML.replace(/(<([^>]+)>)/ig,"");
					j++;
			}
			data = data.replace(/[\n\t]/ig,"");
			return data;
		}	// end ScrapeLoop()
    
function scrapeLoop2(data){   // this version retains tags
      if (data.length==0) 	{ // Finds the first instance of the data field
      data = x[1].innerHTML;		// get the data from this first instance
			}
			else { // Finds additional instances of data from this field that do NOT immediately follow the first instance in MilCat
      data = data + "<div class=\"minispacer\"></div>" + x[1].innerHTML;		// get the additional instances, append to initial one
      }
      var j = 1;
			while ((tr[i+j]!=null) && (tr[i+j].getElementsByTagName('TD')[0].innerHTML == "")) { // Finds additional data fields through the blank TD that immediately follow the first instance TD
          data = data + "<div class=\"minispacer\"></div>" + tr[i+j].getElementsByTagName('TD')[1].innerHTML;
					j++;
			}
      data = data.replace(/[\n\t]/ig,"");
      return data;
		}	// end ScrapeLoop2()    

	harvest_run="1";

	if(label_tableContainer!="0"){
		container= document.getElementById(label_tableContainer); // get the container
		tr = container.getElementsByTagName('TR');		// get the rows for every table in the container
	}
	else{
		tr = document.getElementsByTagName('TR');		// get the rows for every table in the document
	}
	
	for(i = 0; i < tr.length; i++) {
		x=tr[i].getElementsByTagName('TD');		// for each row, get all of the cells
		var x_label_noWS = x[0].innerHTML.replace(/[\s]/g,""); // resource_display inserts extra line breaks in its token content.  This line removes all WS before testing below.

		if (x.length == 2 && x[0].innerHTML == label_ISBN) {		// if I have 2 cells one with the ISBN
			bib_ISBN = x[1].innerHTML.replace(/(<([^>]+)>)/ig,"");		// get the ISBN and strip all tags
			bib_ISBN = bib_ISBN.replace(/[\n\t\s\-]/ig,"");		// regex cleanup of the text
			bib_ISBN = bib_ISBN.replace(/\(.*\)/ig,"");/:.*$/ig,""
			bib_ISBN = bib_ISBN.replace(/:.*$/ig,"");
			exist_ISBN='1';										// flag the variable as populated
		}

		if (x.length == 2 && x[0].innerHTML == label_ISSN) {		// if I have 2 cells one with the ISSN
			bib_ISSN = x[1].innerHTML.replace(/(<([^>]+)>)/ig,"");		// get the ISSN and strip all tags
			// bib_ISSN_long = pre_ISSN + x[1].innerHTML.replace(/(<([^>]+)>)/ig,"");		//  regex cleanup
			bib_ISSN = bib_ISSN.replace(/[\n\t\s]/ig,"");
			bib_ISSN = bib_ISSN.replace(/\(.*\)/ig,"");
			bib_ISSN = bib_ISSN.substr(0, 9);
			exist_ISSN='1';								// flag the variable as populated
		}

		if (x.length == 2 && x[0].innerHTML == label_title) {		// if I have 2 cells one with the title
			bib_title = x[1].innerHTML.replace(/(<([^>]+)>)/ig,"");		// get the title and strip all tags 
			bib_title = bib_title.replace(/[\n\t]/ig,"");
			bib_title = bib_title.replace(/\/.*/ig,"");
			bib_title = bib_title.replace(/:.*$/ig,"");		// strip anything following a ':' - usually a subtitle
			exist_title='1';
		}

		if (x.length == 2 && x_label_noWS == label_ResourceName) { // if I have 2 cells one with the ERM Record Resource Name
			erm_rname = x[1].innerHTML.replace(/(<([^>]+)>)/ig,"");		// get the title and strip all tags 
			erm_rname = erm_rname.replace(/[\n\t\r\f\v]/ig,"");
			erm_rname = erm_rname.replace(/\/.*/ig,"");
			erm_rname = erm_rname.replace(/:.*$/ig,"");		// strip anything following a ':' - usually a subtitle
		}

		if (x.length == 2 && x[0].innerHTML == label_GeneralNote) {		// if I have 2 cells, one with the General Note
			bib_genNote = scrapeLoop(bib_genNote);	// call the scrapeLoop function to capture all instances of the General Note
		}

		if (x.length == 2 && x[0].innerHTML == label_SecurityLevel) {		// if I have 2 cells, one with the Security Level
			bib_secLevel = scrapeLoop(bib_secLevel);	
		}

		if (x.length == 2 && x[0].innerHTML == label_ContactInformation) {		// if I have 2 cells, one with the Contact Information
			bib_conInfo = scrapeLoop(bib_conInfo);
		}

		labelHTML = x[0].innerHTML;

		if (x.length == 2 && labelHTML.search(/label536/)!=-1) {		// if I have 2 cells, with first one containing string label536 (as used in webpub.def)
			data536 = scrapeLoop(data536);	// call the scrapeLoop function to capture all instances of 536, Contract Number
		}

		if (x.length == 2 && labelHTML.search(/label260/)!=-1) {		// if I have 2 cells, with first one containing string label260 (as used in webpub.def).  260 = Publication Info
			data260 = x[1].innerHTML.replace(/[\n\t]/ig,"");		// regex cleanup of the text
		}	
		
		if (x.length == 2 && labelHTML.search(/label261/)!=-1) {		// if I have 2 cells, with first one containing string label261 (as used in webpub.def).  261 = Date
			data261 = x[1].innerHTML.replace(/[\n\t]/ig,"");		// regex cleanup of the text
		}			

		if (x.length == 2 && labelHTML.search(/label914/)!=-1) {		// if I have 2 cells, with first one containing string label914 (as used in webpub.def).  914 = Export Category
			data914 = x[1].innerHTML.replace(/[\n\t]/ig,"");		// regex cleanup of the text
		}	
				
		if (x.length == 2 && labelHTML.search(/label915/)!=-1) {		// if I have 2 cells, with first one containing string label915 (as used in webpub.def).  915 = ECCN
			data915 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}	
		
		if (x.length == 2 && labelHTML.search(/label916/)!=-1) {		// if I have 2 cells, with first one containing string label916 (as used in webpub.def).  916 = Revision date
			data916 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}
				
		if (x.length == 2 && labelHTML.search(/label917/)!=-1) {		// if I have 2 cells, with first one containing string label917 (as used in webpub.def).  917 = Doc revision level
			data917 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}
						
		if (x.length == 2 && labelHTML.search(/label918/)!=-1) {		// if I have 2 cells, with first one containing string label918 (as used in webpub.def).  918 = Doc status note
			data918 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}
		
		if (x.length == 2 && labelHTML.search(/label920/)!=-1) {		// if I have 2 cells, with first one containing string label920 (as used in webpub.def).  920 = Org note
			data920 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}	
				
		if (x.length == 2 && labelHTML.search(/label925/)!=-1) {		// if I have 2 cells, with first one containing string label925 (as used in webpub.def).  925 = Attachment
			data925 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}	
		
		if (x.length == 2 && labelHTML.search(/label926/)!=-1) {		// if I have 2 cells, with first one containing string label926 (as used in webpub.def).  926 = Original release note
			data926 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}	
					
		if (x.length == 2 && labelHTML.search(/label928/)!=-1) {		// if I have 2 cells, with first one containing string label928 (as used in webpub.def).  928 = Record series code
			data928 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}	
					
		if (x.length == 2 && labelHTML.search(/label932/)!=-1) {		// if I have 2 cells, with first one containing string label932 (as used in webpub.def).  932 = Record series code Review Date
			data932 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}		
		
		if (x.length == 2 && labelHTML.search(/label933/)!=-1) {		// if I have 2 cells, with first one containing string label933 (as used in webpub.def).  933 = Doc disposition note
			data933 = x[1].innerHTML.replace(/[\n\t]/ig,"");
		}		
						
		if (x.length == 2 && labelHTML.search(/label936/)!=-1) {		// if I have 2 cells, with first one containing string label936 (as used in webpub.def)
			data936 = scrapeLoop(data936);	// call the scrapeLoop function to capture all instances of 936, Change number and date
		}		
						
		if (x.length == 2 && labelHTML.search(/label937/)!=-1) {		// if I have 2 cells, with first one containing string label937 (as used in webpub.def)
			data937 = scrapeLoop(data937);	// call the scrapeLoop function to capture all instances of 937, Amendment number and date
		}			
					
		if (x.length == 2 && labelHTML.search(/label938/)!=-1) {		// if I have 2 cells, with first one containing string label938 (as used in webpub.def)
			data938 = scrapeLoop(data938);	// call the scrapeLoop function to capture all instances of 938, Supplement number and date
		}

		if (x.length == 2 && labelHTML.search(/label100/)!=-1) {		// if I have 2 cells, with first one containing string label100 (as used in webpub.def)
      data100 = scrapeLoop2(data100);	// call the scrapeLoop function to capture all instances of 100, Author   
      data100 = data100.replace(/<font[^>]*><strong>([^<]*)<\/strong><\/font>/gi, "$1");  // deletes the tags that Millennium generates (<font color="RED"><strong>AnythingButTheStartOfaNewTag</strong></font>) to emphasize the displayed text that matches the search string.  The match retains the AnythingButTheStartOfaNewTag string.
    } 

    if (x.length == 2 && labelHTML.search(/label110/)!=-1) {		// if I have 2 cells, with first one containing string label110 (as used in webpub.def)
      data110 = scrapeLoop2(data110);	// call the scrapeLoop function to capture all instances of 110, Corp Name
    } 

    if (x.length == 2 && labelHTML.search(/label111/)!=-1) {		// if I have 2 cells, with first one containing string label111 (as used in webpub.def)
      data111 = scrapeLoop2(data111);	// call the scrapeLoop function to capture all instances of 111, Conference Title
    } 
    
		if (x.length == 2 && labelHTML.search(/label700/)!=-1) {		// if I have 2 cells, with first one containing string label700 (as used in webpub.def)
      data700 = scrapeLoop2(data700);	// call the scrapeLoop function to capture all instances of 700, Author
    } 

    if (x.length == 2 && labelHTML.search(/label710/)!=-1) {		// if I have 2 cells, with first one containing string label710 (as used in webpub.def)
      data710 = scrapeLoop2(data710);	// call the scrapeLoop function to capture all instances of 710, Corp Name
    } 

    if (x.length == 2 && labelHTML.search(/label711/)!=-1) {		// if I have 2 cells, with first one containing string label711 (as used in webpub.def)
      data711 = scrapeLoop2(data711);	// call the scrapeLoop function to capture all instances of 711, Conference Title
    } 
    
	} // end FOR loop
}