<script>
</script>

<div class="grid-container">
    <div class="Bulletin">
        <h3 class="bulletin">Bulletin</h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel ex tempus, ornare erat eu, ornare velit. Pellentesque tempus neque ac neque tincidunt, ut volutpat urna fringilla. In quis feugiat felis, eget varius mi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam pharetra, ipsum vitae accumsan ullamcorper, neque mi eleifend velit, et convallis libero mauris quis est. Nunc a hendrerit quam. Nam magna metus, ullamcorper sed tristique id, egestas vel magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam bibendum bibendum leo. </p>
    </div>
    <div class="Regional-Info">
        <h3>Regional Information</h3>
        <p>Image of a map of the regions that are covered by LWM to go here</p>
    </div>
    <div class="Why-LWM">
        <h3>Why choose <span class="LWM">LWM</span> Driving School?</h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel ex tempus, ornare erat eu, ornare velit. Pellentesque tempus neque ac neque tincidunt, ut volutpat urna fringilla. In quis feugiat felis, eget varius mi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam pharetra, ipsum vitae accumsan ullamcorper, neque mi eleifend velit, et convallis libero mauris quis est. Nunc a hendrerit quam. Nam magna metus, ullamcorper sed tristique id, egestas vel magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam bibendum bibendum leo. </p>
    </div>
  </div>

  <style>

    .LWM {
        color: #981E32
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
            grid-template-rows: repeat(3, 1fr);
            gap: 0px 0px;
            grid-template-areas:
                "Bulletin"
                "Regional-Info"
                "Why-LWM"
        }
    }

    @media(min-width:992px) {
        .grid-container {
            width: 970px;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(3, 1fr);
            gap: 0px 0px;
            grid-template-areas:
                "Bulletin"
                "Regional-Info"
                "Why-LWM"
        }
    }

    @media(min-width:1220px) {
        .grid-container {
            width: 1200px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 0px 0px;
            grid-template-areas:
                "Bulletin Bulletin"
                "Regional-Info Why-LWM";
        }
    }

    .Bulletin { grid-area: Bulletin; }

    .Regional-Info { grid-area: Regional-Info; }

    .Why-LWM { grid-area: Why-LWM; }


</style>