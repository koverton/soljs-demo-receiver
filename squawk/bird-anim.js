// Requires the following HTML elements:
//	<img id="theBird" src="bird_quiet.png" >
//	<div id="birdText" class="top-left"></div>
//
// Requires the following CSS styles in style.css
//      .top-left : sets positioning of the birdText in relation to the IMG

var BirdAnim = (function() {
	const quietBird = 'bird_quiet.png'
	const loudBird  = 'bird_squawk.png'
	const birdId    = 'theBird'
	const birdTxtId = 'birdText'

	var birdTimer = null

	function swapTheBird(birdId, newBird, birdTextId, timer) {
		document.getElementById(birdId).src = newBird
		document.getElementById(birdTextId).innerHTML = ''
		clearInterval(timer)
	}

	var pokeTheBird = function (text) {
		console.log('Squawking: ' + text)
		var curBird = document.getElementById(birdId)
		var birdText = document.getElementById(birdTxtId)
		if (birdTimer != null) {
			clearInterval(birdTimer);
		}
		if (curBird.src.endsWith(quietBird)) {
			birdText.innerHTML = text
			curBird.src = loudBird
			birdTimer = setInterval(swapTheBird, 600, birdId, quietBird, birdTxtId, birdTimer)
		}
		else {
			birdText.innerHTML = ''
			curBird.src = quietBird
			birdTimer = setInterval(swapTheBird, 400, birdId, loudBird, birdTxtId, birdTimer)
		}
	}

	return {
		pokeTheBird    : pokeTheBird
	}
})();
