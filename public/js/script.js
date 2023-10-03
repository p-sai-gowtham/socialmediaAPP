const like = document.querySelector('.like');
const form = document.querySelector('.form');
like.addEventListener('click', () => {
    form.submit();
})