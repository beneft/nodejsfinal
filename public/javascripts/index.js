$(document).ready(() => {
    var user = JSON.parse($('#user').val());
    $.get('/api/items', (pageItems) => {
        pageItems.forEach((item) => {
            if (user && user.role==='admin'){
                const carouselItem = `
                <div class="carousel-wrapper">
                    <div class="owl-carousel">
                            <div class="item">
                                <img src="${item.images[0]}" alt="Image 1">
                            </div>
                            <div class="item">
                                <img src="${item.images[1]}" alt="Image 2">
                            </div>
                            <div class="item">
                                <img src="${item.images[2]}" alt="Image 3">
                            </div>               
                    </div>
                    <h2>${item.title.en}</h2>
                    <p>${item.description.en}</p>
                    <button class="edit-btn" data-item-id="${item._id}">Edit</button>
                    <button class="delete-btn" data-item-id="${item._id}" style="display:inline-block;">Delete</button>
                </div>
            `;
                $('#carousels').append(carouselItem);
            } else {
                const carouselItem = `
                <div class="carousel-wrapper">
                    <div class="owl-carousel">
                            <div class="item">
                                <img src="${item.images[0]}" alt="Image 1">
                            </div>
                            <div class="item">
                                <img src="${item.images[1]}" alt="Image 2">
                            </div>
                            <div class="item">
                                <img src="${item.images[2]}" alt="Image 3">
                            </div>               
                    </div>
                    <h2>${item.title.en}</h2>
                    <p>${item.description.en}</p>               
                </div>
            `;
                $('#carousels').append(carouselItem);
            }
        });

        $('.owl-carousel').owlCarousel({
            loop: true,
            margin: 10,
            nav: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 1
                },
                1000: {
                    items: 1
                }
            }
        });
        $('.edit-btn').on('click', async function() {
            const itemId = $(this).data('item-id');
            window.location.href = `/edititem?itemId=${itemId}`;
        });

        $('.delete-btn').on('click', function() {
            const itemId = $(this).data('item-id');
            if (confirm('Are you sure you want to delete this item?')) {
                window.location.href = `/delete?itemId=${itemId}`;
            }
        });
    });
});