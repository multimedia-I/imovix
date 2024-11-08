window.onload = copyright();

function copyright()  {
    const copyrightYear = new Date().getFullYear();
    document.getElementById("copyright").innerHTML = copyrightYear + '&copy; Copyright';
}