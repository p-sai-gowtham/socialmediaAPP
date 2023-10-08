const likes = document.querySelectorAll('.checkbox');
likes.forEach(like => {
    like.addEventListener('click', () => {
        const form = like.parentElement.parentElement;
        form.submit();
    })
    
});