<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    export let items;
    export let activeItem;
</script>


<div class="header">
    <span class="name">
        <h3><span class="LWM">LWM</span> Driving School</h3>
    </span>
    <br>
    <ul>
        {#each items as item}
            <li on:click={() => dispatch('tabChange', item)}>
                <div class:active={item === activeItem}>{item}</div>
            </li>
        {/each}
    </ul>
</div>

<style>
	.header {
		border-bottom: 3px solid #9A9B9C;
		font-weight: 400;
        width: 100%;
        text-align: center;
	}

    .name {
        padding: 0;

    }

    h3 {
        display: inline-block;
        padding: 0;
        font-size: 35px;
        line-height: 34px;
        height: 35px;
        margin-top: -2px;
        margin-bottom: 3px;
    }

    .LWM {
        color: #981E32
    }

    ul {
        display: inline-flex;
        padding: 0;
        list-style-type: none;
        margin: 1px;
    }

	li {
		display: block;
		justify-content: left;
        cursor: pointer;
        padding: 10px;
        font-size: 18px;
	}

	.active {
        color: #981e32;
        border-bottom: 2px solid #981e32;
        padding-bottom: 2px;
	}
</style>
