<script>

    import TestimonialCard from '../components/TestimonialCard.svelte'
    let photo1 = 'https://www.passwithmartin.co.uk/images/user/image/2851/2851_ben_jewett.jpg'
    let text1 = 'Martin was a brilliant instructor! He was understanding, knowledgable and friendly and and got me a first time pass. I can not recommend him enough, his lessons are something I looked forward to every week! Thanks Martin.'
    let photo2 = 'https://www.passwithmartin.co.uk/images/user/image/2851/2851_fraya_fuller.jpg'
    let text2 = '1st Time Pass with Martin!'
    let photo3 = 'https://www.passwithmartin.co.uk/images/user/image/2851/2851_rouen_de_villiers.jpg'
    let text3 = 'I recently had the privilege of having Martin Fender as my driving instructor. Although I only had a few lessons Martin quickly figured out where my strength and weaknesses were. Martin is great instructor, explained things very well, always friendly and very accommodating. Martin has a great demeanor and has a great sense of humor. Thank you very much Martin, God Bless.'
    let photo4 = 'https://www.passwithmartin.co.uk/images/user/image/2851/2851_matthew_prior.jpg' 
    let text4 = '1st Time Pass with 0 Minors!!'
    let photo5 = 'https://www.passwithmartin.co.uk/images/user/image/2851/2851_george-alexandru_caldaruse.jpg'
    let text5 = "I am going to start by saying that my first driving instructor from another driving school wasn't the most pleasing. Once I started taking lessons with Martin I became more confident. He is a perfectionist therefore will try and push you to become better, giving you the necessary feedback for you to improve. He is an awesome person and you don't feel pressured, ashamed or feel any sort of discomfort driving with him. We occasionally made a few jokes here and there to burn some steam off and always tries to make your driving schedule as comfortable as it can be. Overall I have improved massively from the first lessons with my first instructor to how I am driving now thanks to Martin. 😁 Fully recommend taking lessons with this amazing person.😁"
    let photo6 = 'https://www.passwithmartin.co.uk/images/user/image/2851/2851_melissa_annis.jpg' 
    let text6 =  "I would highly recommend Martin from LDC Driving School. From the start Martin made sure I was comfortable and ready to drive. He helped establish confidence while driving. He holds the bar high so that when you take your test you are more than ready."

</script>

<div class="grid-container">
    <div class="Testimonial-1"><TestimonialCard photo={photo1} text={text1}/></div>
    <div class="Testimonial-2"><TestimonialCard photo={photo2} text={text2}/></div>
    <div class="Testimonial-3"><TestimonialCard photo={photo3} text={text3}/></div>
    <div class="Testimonial-4"><TestimonialCard photo={photo4} text={text4}/></div>
    <div class="Testimonial-5"><TestimonialCard photo={photo5} text={text5}/></div>
    <div class="Testimonial-6"><TestimonialCard photo={photo6} text={text6}/></div>
  </div>



<style>

    .grid-container {
        margin-left: auto;
        margin-right: auto;
        padding-top: 50px;
    }


    @media(min-width:300px) {
        .grid-container {
            width: 250px;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(6, 1fr);
            gap: 20px 0px;
            grid-template-areas:
            "Testimonial-1"
            "Testimonial-2"
            "Testimonial-3"
            "Testimonial-4"
            "Testimonial-5"
            "Testimonial-6";
        }
    }

    @media(min-width:768px) {
        .grid-container {
            width: 750px;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(6, 1fr);
            gap: 20px 0px;
            grid-template-areas:
            "Testimonial-1"
            "Testimonial-2"
            "Testimonial-3"
            "Testimonial-4"
            "Testimonial-5"
            "Testimonial-6";
        }
    }

    @media(min-width:992px) {
        .grid-container {
            width: 970px;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(6, 1fr);
            gap: 20px 0px;
            grid-template-areas:
                "Testimonial-1"
                "Testimonial-2"
                "Testimonial-3"
                "Testimonial-4"
                "Testimonial-5"
                "Testimonial-6";
        }
    }

    @media(min-width:1220px) {
        .grid-container {
            width: 1200px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: .7fr repeat(2, 1fr);
            gap: 20px 20px;
            grid-template-areas:
                "Testimonial-1 Testimonial-2 Testimonial-3"
                "Testimonial-4 Testimonial-5 Testimonial-6";
        }
    }

.Testimonial-1 { grid-area: Testimonial-1; }

.Testimonial-2 { grid-area: Testimonial-2; }

.Testimonial-3 { grid-area: Testimonial-3; }

.Testimonial-4 { grid-area: Testimonial-4; }

.Testimonial-5 { grid-area: Testimonial-5; }

.Testimonial-6 { grid-area: Testimonial-6; }

</style>