// Function to show database progress
function databaseProgress(totalRows, currentRow) {
    const percent = ((currentRow / totalRows) * 100).toFixed(2);
    const progressBar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
    process.stdout.write(`\rProgress: [${progressBar}] ${currentRow}/${totalRows} ${percent}%`);
	
	const interval = setInterval(() => {
        if (currentRow >= totalRows) {
            clearInterval(interval);
            console.log('\r\nDatabase check complete.');
        }
    }, 100);
}

module.exports = databaseProgress;