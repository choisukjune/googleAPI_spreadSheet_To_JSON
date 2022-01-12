//-----------------------------------------------------------------------------------------------;
//-----------------------------------------------------------------------------------------------;
//-----------------------------------------------------------------------------------------------;
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis').google;

//-----------------------------------------------------------------------------------------------;
//-----------------------------------------------------------------------------------------------;
//-----------------------------------------------------------------------------------------------;


var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_PATH = 'token.json';

try
{
	var credentail = JSON.parse( fs.readFileSync('credential_2.json' ).toString() );
}
catch(e)
{
	console.log('Error loading client secret file:', e);
	return;
}

var spreadsheetId = "1GwSGSraqD2mwvsw2pp0ouD_GvhhEyEmTSVWn2xMyZaQ";
var OPTIONS = {
	FUNC00 : {
		spreadsheetId : spreadsheetId
		, range : '생산발주!A:M'
	}
}

//-----------------------------------------------------------------------------------------------;
//-----------------------------------------------------------------------------------------------;
//-----------------------------------------------------------------------------------------------;


//구글계정인증;
var  authorize = function( credentials, callback ){

	console.log( "[s] - authorize();" )

	var client_secret = credentials.web.client_secret;
	var client_id = credentials.web.client_id;
	var redirect_uris = credentials.web.redirect_uris;
	var oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[0] );

	//인증토크체크;
	fs.readFile(TOKEN_PATH, function(err, token){
		
		if(err) return getNewToken(oAuth2Client, callback);
		
		oAuth2Client.setCredentials(JSON.parse(token));
	
		console.log( "[e] - authorize();" )
		
		callback(oAuth2Client);
	});
}

//구글계정인증실패시 토큰재생성;
var getNewToken = function getNewToken( oAuth2Client, callback ){
	
	console.log( "[s] - getNewToken();" )
	
	var authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
	
	console.log('Authorize this app by visiting this url : ', authUrl);

	var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	rl.question('Enter the code from that page here: ', function(code){
	  
	  rl.close();
	  
	  oAuth2Client.getToken(code, (err, token) => {
		
		if (err) return console.error('Error while trying to retrieve access token', err);
		
		oAuth2Client.setCredentials(token);

		//인증된 토큰을 JSON파일로 저장한다.
		fs.writeFileSync(TOKEN_PATH, JSON.stringify(token),{ flag : "w"} );

		console.log( "[e] - getNewToken();" )
		
		callback( oAuth2Client );

	  });
	});
  }

//-------------------------------------------------------;
// FUNCTION;
//-------------------------------------------------------;

var numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var dateFormat_YYMMDDHHMMSS = function( date ){
	date = date || new Date();

	var YYYY = date.getFullYear();
	var MM = pad( date.getMonth() + 1, 2 );
	var DD = pad( date.getDate(), 2 );
	var H = pad( date.getHours(), 2 );
	var M = pad( date.getMinutes(), 2 );
	var S = pad( date.getSeconds(), 2 );

	return YYYY + MM + DD + H +  M + S;
};

var dateFormat_YYMMDD = function( date ){
	date = date || new Date();

	var YYYY = date.getFullYear();
	var MM = pad( date.getMonth() + 1, 2 );
	var DD = pad( date.getDate(), 2 );
//	var H = pad( date.getHours(), 2 );
//	var M = pad( date.getMinutes(), 2 );
//	var S = pad( date.getSeconds(), 2 );

	return YYYY + MM + DD;// + H +  M + S;
};

var pad = function(n, width){
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}


var sheetDataToJSON = function( auth ){

	var key = "FUNC00"

	console.log( "[ S ] - FUNC00();" )

	google.sheets({version: 'v4', auth}).spreadsheets.values.get( OPTIONS[ key ], function(err, res){
		if (err) return console.log('The API returned an error: ' + err);
		const rows = res.data.values;
		if (rows.length == 0 ) return console.log( key + ' -- No data found.');
		
		var o;
		var arr = [];
		var headers = rows[0];

		var i = 1,iLen = rows.length,io;
		for(;i<iLen;++i){
			io = rows[ i ];

			o = {};
			var j = 0,jLen = io.length,jo;
			for(;j<jLen;++j){
				jo = io[ j ];
				o[ headers[ j ] ] = jo;
			}
			
			arr.push( o );

		}
		
		fs.writeFileSync(dateFormat_YYMMDDHHMMSS()+ ".json", JSON.stringify(arr, null, 4) )

	});
}



authorize( credentail, sheetDataToJSON );
