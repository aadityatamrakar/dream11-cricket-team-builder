var https = require('https');
// let csrf_token = 'fae824f3-6118-c490-3e3e-22b1f4da3af6';
// let cookie = 'IPL_Offer=variant3; dh_user_id=amp-2STsVjRFGq4bhgxE3JXOJg; __csrf=fae824f3-6118-c490-3e3e-22b1f4da3af6; ajs_anonymous_id=%22050718f4-7ad7-4ebb-af35-3967608828d0%22; WZRK_G=6ddabcbcded04590a303ab22a0ee0039; G_ENABLED_IDPS=google; connect.sid=s%3AqXSLzAud4Cwm8aJbDTBdb5YcJR7kMyM9.%2BEf3MceN%2FAYi5dIphoEkj%2BuDisbjvnOk9%2FdEjIkHxZk; _gid=GA1.2.502654594.1602442604; _ga=GA1.1.405266286.1602442604; _ga_6NJVXEJHSD=GS1.1.1602442603.1.1.1602442631.0; WZRK_S_W4R-49K-494Z=%7B%22p%22%3A1%2C%22s%22%3A1602505054%2C%22t%22%3A1602505240%7D';

let csrf_token = 'b72cfe53-f170-0654-f0fc-3c5162723a6c';
let cookie = 'IPL_Offer=variant0; dh_user_id=amp-SBQ9FtlBr1dut6zpzPDgzw; _ga=amp-A6AA_wOXvUef9WI9VSNCzA; __csrf=b72cfe53-f170-0654-f0fc-3c5162723a6c; ajs_anonymous_id=%226a6a5eeb-580c-4271-baf5-3077d6520367%22; WZRK_G=e2916844074649c89879d33d8a8a7dc8; G_ENABLED_IDPS=google; connect.sid=s%3AfwZ4mbTvPCaqcLfMCxUOVIlj5MiWavA9.LLK1yCbcYzl2BcXxI0OgBx0PQVtFM1XHLy5V39nRcDU; WZRK_S_W4R-49K-494Z=%7B%22p%22%3A1%2C%22s%22%3A1602539778%2C%22t%22%3A1602540053%7D';

async function updateTeams(playerCol, matchId, tourId, site = 'cricket') {
	for (let index = 0; index < playerCol.length; index++) {
		const players = playerCol[index];
		let resp = await updateTeam(players, matchId, tourId, index + 1, site);
		console.log(resp);
	}
}

function updateTeam(players, matchId, tourId, teamId, site = 'cricket') {
	return new Promise((resolve, reject) => {
		var options = {
			'method': 'POST',
			'hostname': 'www.dream11.com',
			'path': '/graphql/mutation/pwa/shme-create-user-team',
			'headers': {
				'device': 'pwa',
				'x-csrf': csrf_token,
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
				'content-type': 'application/json',
				'cookie': cookie
			},
			'maxRedirects': 20
		};

		var req = https.request(options, function (res) {
			var chunks = [];

			res.on("data", function (chunk) {
				chunks.push(chunk);
			});

			res.on("end", function (chunk) {
				var body = Buffer.concat(chunks);
				resolve(body.toString());
			});

			res.on("error", function (error) {
				console.log(error);
				reject(error);
			});
		});

		var postData = JSON.stringify({
			"query": "mutation ShmeCreateUserTeam( $teamId: Int $matchId: Int! $players: [PlayerInput]! $tourId: Int! $site: String!) { createUserTeam( teamId: $teamId matchId: $matchId players: $players tourId: $tourId site: $site ) { id }}",
			"variables": {
				"players": players,
				"teamId": teamId,
				"matchId": matchId,
				"tourId": tourId,
				"site": site
			}
		});

		req.write(postData);

		req.end();
	});
}

module.exports = updateTeams;