
    var canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let mousePressed = false;
    let signTest = 0;

    canvas.addEventListener("mousedown" , function(e) {mousePressed = !mousePressed});

    canvas.addEventListener("mouseup" , function(e) {mousePressed = !mousePressed});

    document.addEventListener("mousemove", function(e){
        let rect = canvas.getBoundingClientRect();
        let mousePosX = e.clientX - rect.left;
        let mousePosY = e.clientY - rect.top;
        if (mousePressed === true)
        {
            ctx.beginPath();
            ctx.fillRect(mousePosX,mousePosY, 3,3);
            ctx.fillStyle = "#000000";
            ctx.closePath();
            signTest++;
        }
    }, false);

    let resetCanvas = document.getElementById('resetCanvas');

    resetCanvas.addEventListener('click', function(e){
        signTest = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });