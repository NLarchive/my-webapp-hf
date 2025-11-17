// JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Button click test
    const testButton = document.getElementById('testButton');
    const jsOutput = document.getElementById('jsOutput');
    
    testButton.addEventListener('click', function() {
        const now = new Date().toLocaleString();
        jsOutput.textContent = `✓ JavaScript is working! Clicked at: ${now}`;
        jsOutput.style.display = 'block';
    });

    // Load PHP content
    function loadPhpContent() {
        const phpContent = document.getElementById('phpContent');
        
        fetch('api.php')
            .then(response => response.json())
            .then(data => {
                phpContent.innerHTML = `
                    <p><strong>Server Message:</strong> ${data.message}</p>
                    <p><strong>Server Time:</strong> ${data.timestamp}</p>
                    <p><strong>Random Number:</strong> ${data.random}</p>
                `;
            })
            .catch(error => {
                phpContent.innerHTML = `<p style="color: red;">Error loading PHP: ${error.message}</p>`;
            });
    }

    // Load PHP on page load
    loadPhpContent();

    // Reload PHP button
    document.getElementById('loadPhp').addEventListener('click', loadPhpContent);

    // Form submission
    const testForm = document.getElementById('testForm');
    const formResponse = document.getElementById('formResponse');

    testForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('nameInput');
        const formData = new FormData();
        formData.append('name', nameInput.value);

        fetch('process.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            formResponse.innerHTML = `
                <p><strong>${data.greeting}</strong></p>
                <p>Processed at: ${data.timestamp}</p>
            `;
            formResponse.style.display = 'block';
            nameInput.value = '';
        })
        .catch(error => {
            formResponse.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        });
    });
});
