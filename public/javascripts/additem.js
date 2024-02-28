document.getElementById('addItemForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });

    try {
        const response = await fetch('/additem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        });

        if (!response.ok) {
            throw new Error('Failed to add page item.');
        }

        window.location.href = '/';
    } catch (error) {
        console.error(error);
    }
});