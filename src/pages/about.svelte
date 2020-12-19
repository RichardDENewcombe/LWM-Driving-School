<script>
</script>


<div class="grid-container">
    <div class="About-LWM">
        <h3>About <span class="LWM">LWM</span> Driving School</h3>
        <p>LWM Driving school aim to provide you with a calm and open learning experience to allow you to flourish into a calm and confident driver.</p>
        <p>With a 200% first time pass rate we consistently provide our students with every skill they could ever require on the road.</p>
        <p>We set ourselves apart from large chain driving schools by providing a bespoke training schedule based around each students individual requirements. These are formulated during the first 2 hours spent with the student and have been shown to increase first time pass rates.</p>
    </div>
    <div class="About-Me">
        <h3>About Me</h3>
        <p>My name is Martin and I'm a fully qualified Government approved Driving Instructor (ADI) and I am passionate about road safety.</p>
        <p>I decided to train to become a driving instructor because I wanted a job with real satisfaction and there is nothing better than seeing someone pass their test first time. I was also always being told by friends and work colleagues that I was a calm and relaxed type of person and that I would make a great driving instructor</p>
        <p>My lessons are always conducted in a calm, friendly and relaxed manner as I firmly believe in making pupils feel at ease during lessons.</p>
    </div>
    <div class="Me-Photo">
        <img class="person" src="https://image.freepik.com/free-vector/man-profile-cartoon_18591-58482.jpg" alt="Mr. Fender">
    </div>
    <div class="Car-Photo">
        <img class="car" src="images/car.jpg" alt="My Training Vehicle">
    </div>
    <div class="About-the-Car">
        <h3>About The Car</h3>
        <p>I am currently using an Alfa Romeo Gulia GTA as my training vehicle.</p>
        <p>Its 2.9L Twin-Turbo V6 engine provides the perfect amount of torque to allow learners to easily get off the line and builds confidence with every mile.</p>
        <p>The 8 speed "automatic" gearbox is technically an automated manual so who knows how the law looks at passing your test in one of these.</p>
    </div>

  </div>



<style>

    img.person {max-width: 30%; height: auto; border-radius: 10px;}

    img.car {max-width: 75%; height: auto; border-radius: 10px;}

    .LWM {
        color: #981E32
    }

    * {
        box-sizing: border-box;
    }

    .grid-container {
        margin-left: auto;
        margin-right: auto;
    }


    @media(min-width:768px) {
        .grid-container {
            width: 750px;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(5, 1fr);
            gap: 0px 0px;
            grid-template-areas:
                "About-LWM"
                "About-Martin"
                "Martin-Photo"
                "About-the-Car"
                "Car-Photo";
        }
    }

    @media(min-width:992px) {
        .grid-container {
            width: 970px;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(5, 1fr);
            gap: 0px 0px;
            grid-template-areas:
                "About-LWM"
                "About-Martin"
                "Martin-Photo"
                "About-the-Car"
                "Car-Photo";
        }
    }

    @media(min-width:1220px) {
        .grid-container {
            width: 1200px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: .7fr repeat(2, 1fr);
            gap: 0px 0px;
            grid-template-areas:
                "About-LWM About-LWM"
                "About-Me Me-Photo"
                "Car-Photo About-the-Car";
        }
    }
    

    .About-LWM { grid-area: About-LWM; }

    .Me-Photo { grid-area: Me-Photo; text-align: center;}

    .Car-Photo { grid-area: Car-Photo; text-align: center;}

    .About-Me { grid-area: About-Me; }

    .About-the-Car { grid-area: About-the-Car; }


</style>