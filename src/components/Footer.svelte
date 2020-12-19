<script>
	import PhoneInTalk from 'svelte-material-icons/PhoneInTalk.svelte';
	import Email from 'svelte-material-icons/Email.svelte';
	let size = '3em';
	let color = 'black';
	let width = size;
	let height = size;
	let viewBox = '0 0 24 24'

</script>

<footer>
	<a href="tel:07826 063491">
		<PhoneInTalk {color} {size} {width} {height} {viewBox}/>
	</a>
	<a href="mailto:test@test.com">
		<Email {color} {size} {width} {height} {viewBox}/>
	</a>
</footer>

<style>
	footer {
		border-top: 3px solid #9A9B9C;
		font-weight: 300;
		padding: 0 1em;
		position: fixed;
		bottom: 0px;
		width: 100%;
		z-index: 1;
		background-color: white;
	}

	@media(max-width:1219px) {
		footer {
			position:relative;
		}
	}

</style>