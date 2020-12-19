<script>

    export let photo;
    export let text;

</script>

<div class="container" style="--image: url({photo});">
    <p class="{text.length > 500 ? "long" : ''}">{text}</p>
</div>

<style>

    .container {
        border: 2px solid black;
        border-radius: 10px;
        background-image: var(--image);
        background-size: cover;
        background-repeat: no-repeat;
        max-width: 100%;
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    p {
        color: black;
        font-size: 15px;
        background-color: rgba(154,155,156, 0.5);
        text-align:center;
        position: absolute;
        bottom: 0;
    }

    .long {
        font-size: 12px;
    }

    @media(min-width:300px) {
        .long {
            font-size: 11px;
        }
    }


</style>