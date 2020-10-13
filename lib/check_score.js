let player_points = require('../player_points.json');

function getTeamScore(players, lineUp) {
	let playerScore = players.reduce((o, a) => (o[a.id] = player_points[a.name], o), {});
	return lineUp.reduce((s, a) => {
		s += playerScore[a.id] ? playerScore[a.id] : 0;
		if (a.role) {
			if (a.role.id == 1) s += playerScore[a.id];
			if (a.role.id == 2) s += playerScore[a.id] * 0.5;
		}
		return s;
	}, 0);
}

module.exports = getTeamScore;