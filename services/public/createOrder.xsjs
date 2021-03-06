/** Create a Sales Order using Service Layer **/
$.import("b1sa.beaconsOne.lib", "constants");
$.import("b1sa.beaconsOne.lib", "B1SLLogic");

var output = {};

function run(body) {
	try {
		// SL credentials
		var loginInfo = {};
		loginInfo.UserName = $.b1sa.beaconsOne.lib.constants.getB1User();
		loginInfo.Password = $.b1sa.beaconsOne.lib.constants.getB1Password();
		loginInfo.CompanyDB = $.b1sa.beaconsOne.lib.constants.getB1Company();

		// SL LOGIN          
		var response = $.b1sa.beaconsOne.lib.B1SLLogic.SLLogin(JSON.stringify(loginInfo), null, null);

		var SESSIONID, NODEID;

		// B1SESSION and ROUTEID cookies returned by Login
		for (var j in response.cookies) {
			if (response.cookies[j].name === "B1SESSION") {
				SESSIONID = response.cookies[j].value;
				output.SessionID = SESSIONID;
			} else if (response.cookies[j].name === "ROUTEID") {
				NODEID = response.cookies[j].value;
				output.NodeID = NODEID;
			}
		}


        var d = new Date();
        var DocDueDate = d.getFullYear() 
                                + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' 
                                + ('0' +  d.getDate()).slice(-2); 
                                
		body.DocDueDate = DocDueDate;
		output.RecOder = body;

		response = $.b1sa.beaconsOne.lib.B1SLLogic.PostOrder(JSON.stringify(body), SESSIONID, NODEID);

		// Handle Results
		for (var i in response.headers) {
			if (response.headers[i].name == "~status_code") {
				output.StatusCode = response.headers[i].value;
				break;
			}
		}

		//Parse response body
		body = JSON.parse(response.body.asString());
		output.DocNum = body.DocNum;
		output.DocEntry = body.DocEntry;
		output.DocTotal = body.DocTotal;
		output.DocCurrency = body.DocCurrency;
			
		$.response.contentType = "application/json";
		$.response.status = $.net.http.OK;
		$.response.setBody(JSON.stringify(output));

	} catch (e) {

	}
}

var reqBody;

try{
    reqBody = $.request.body.asString();
    reqBody = JSON.parse(reqBody);
}catch(e){
    reqBody = null;
}


if (reqBody === undefined || reqBody === null) {

	/**	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify({
		"error": 'Mensagem sem Corpo'
	})); 
	**/
	/** Only for Testing **/
	reqBody = {
		"CardCode": 'C20000',
		"DocDueDate": "2017-01-90",
		"Comments": "Test Order is ON"
	};
	var lines = [];

	lines.push({
		"ItemCode": "R00001",
		"Quantity": 1
	});
	lines.push({
		"ItemCode": "A00001",
		"Quantity": 1
	});
	reqBody.DocumentLines = lines;
}

run(reqBody);