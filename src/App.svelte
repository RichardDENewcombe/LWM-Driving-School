<script>
	import Footer from './components/Footer.svelte';
	import Header from './components/Header.svelte';
	import Home from './pages/home.svelte'
	import About from './pages/about.svelte'
	import Testimonials from './pages/testimonials.svelte'
	import Pricing from './pages/pricing.svelte'

	let items = ['Home', 'About', 'Testimonials', 'Pricing'];
	let activeItem = 'Home';
	const navChange = (e) => activeItem = e.detail;
</script>

<Header {activeItem} {items} on:tabChange={navChange} />
<main>
	{#if activeItem === 'Home'}
		<Home />
	{:else if activeItem === 'About'}
		<About />
	{:else if activeItem === 'Testimonials'}
		<Testimonials />
	{:else if activeItem === 'Pricing'}
		<Pricing />
	{/if}
</main>

<Footer />


<style>

	main {
		max-height: 100%;
		overflow-y: hidden;
	}
</style>