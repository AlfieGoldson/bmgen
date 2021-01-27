if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
		() => {
			console.info('Developer for Life Service Worker Registered');
		},
		(err) =>
			console.error(
				'Developer for Life Service Worker registration failed: ',
				err
			)
	);

	navigator.serviceWorker.ready.then(() => {
		console.info('Developer for Life Service Worker Ready');
	});
}

function genBM() {
	const input = document.getElementById('input');
	const count = parseInt(input.value);
	const emotes = ['😂', '😹', '😭', '🤣', '💀'];

	let out = '';
	for (let i = 0; i < count; i++) {
		out += emotes[Math.round(Math.random() * (emotes.length - 1))];
	}

	const outInput = document.getElementById('out');
	outInput.value = out;
	outInput.select();
	outInput.setSelectionRange(0, 99999);

	document.execCommand('copy');

	console.log(out);
}
