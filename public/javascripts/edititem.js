$(document).ready(() => {
    const getItemFromPage = () => {
        const itemJson = $('#item').val();
        if (itemJson) {
            return JSON.parse(itemJson);
        }
        return null;
    };
    const prefillForm = (item) => {
        $('#image1').val(item.images[0]);
        $('#image2').val(item.images[1]);
        $('#image3').val(item.images[2]);
        $('#title_en').val(item.title.en);
        $('#description_en').val(item.description.en);
        $('#title_ru').val(item.title.ru);
        $('#description_ru').val(item.description.ru);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const id = getItemFromPage()._id;

        const formData = new FormData(event.target);

        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        formDataObject.id = id;
        try {
            const response = await fetch('/edititem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataObject)
            });

            if (!response.ok) {
                throw new Error('Failed to edit page item.');
            }

            window.location.href = '/';
        } catch (error) {
            console.error(error);
        }
    };

    const item = getItemFromPage();
    if (item) {
        prefillForm(item);
    }
    $('#editItemForm').on('submit', handleSubmit);
});