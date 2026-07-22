<script lang="ts">
	const lastUpdated = 'July 21, 2026';
	const contactEmail = 'privacy@elmoldasoft.us';
</script>

<svelte:head>
	<title>Privacy Policy — GasTrack</title>
	<meta name="description" content="How GasTrack collects, uses, and protects your data." />
</svelte:head>

<div class="max-w-md mx-auto bg-white min-h-screen shadow-xl">
	<header class="bg-dark text-white px-5 pt-10 pb-8 rounded-b-[2.5rem] shadow-lg">
		<a href="/" class="text-slate-400 text-xs font-semibold uppercase tracking-wider hover:text-white transition">
			<i class="fas fa-arrow-left mr-1"></i> GasTrack
		</a>
		<h1 class="text-2xl font-bold tracking-tight text-white mt-3">Privacy Policy</h1>
		<p class="text-slate-400 text-xs mt-1">Last updated: {lastUpdated}</p>
	</header>

	<article class="px-5 py-6 space-y-6 text-sm text-slate-600 leading-relaxed">
		<section class="space-y-2">
			<p>
				GasTrack ("we", "us") is a personal vehicle fuel-tracking application operated by
				ElMolda Software. This policy explains what data we collect, why, and your choices.
			</p>
		</section>

		<section class="space-y-2">
			<h2 class="text-base font-bold text-slate-800">Information we collect</h2>
			<ul class="list-disc pl-5 space-y-1">
				<li><strong>Account data:</strong> your email address and username, provided directly or via Google Sign-In.</li>
				<li><strong>Vehicle data:</strong> vehicle details you add (brand, model, year, license plate, optional photo).</li>
				<li><strong>Fuel logs:</strong> the fill-up entries you record (distance, fuel, price, date, driving conditions).</li>
				<li><strong>Technical data:</strong> basic request information needed to operate and secure the service.</li>
			</ul>
		</section>

		<section class="space-y-2">
			<h2 class="text-base font-bold text-slate-800">How we use your information</h2>
			<ul class="list-disc pl-5 space-y-1">
				<li>To authenticate you and keep your account secure.</li>
				<li>To store and display your vehicles, fuel logs, and efficiency statistics.</li>
				<li>To operate, maintain, and improve the application.</li>
			</ul>
			<p>We do not sell your personal data, and we do not use it for advertising.</p>
		</section>

		<section class="space-y-2">
			<h2 class="text-base font-bold text-slate-800">Google Sign-In</h2>
			<p>
				If you sign in with Google, we receive your email address and basic profile information
				to create and identify your account. We request only the minimum scopes required for
				sign-in and do not access any other Google data.
			</p>
		</section>

		<section class="space-y-2">
			<h2 class="text-base font-bold text-slate-800">Data storage &amp; sharing</h2>
			<p>
				Your data is stored in managed cloud infrastructure used to run the service (database,
				hosting, and file storage providers). We share data with these providers only as needed
				to operate GasTrack, and with authorities where required by law.
			</p>
		</section>

		<section class="space-y-2">
			<h2 class="text-base font-bold text-slate-800">Data retention &amp; deletion</h2>
			<p>
				We keep your data while your account is active. You can clear all your vehicles and fuel
				logs at any time from Settings. To delete your account and associated data, contact us at
				<a href={`mailto:${contactEmail}`} class="text-primary font-semibold">{contactEmail}</a>.
			</p>
		</section>

		<section class="space-y-2">
			<h2 class="text-base font-bold text-slate-800">Your rights</h2>
			<p>
				You may request access to, correction of, or deletion of your personal data by contacting
				us. We will respond within a reasonable timeframe.
			</p>
		</section>

		<section class="space-y-2">
			<h2 class="text-base font-bold text-slate-800">Contact</h2>
			<p>
				Questions about this policy? Email
				<a href={`mailto:${contactEmail}`} class="text-primary font-semibold">{contactEmail}</a>.
			</p>
		</section>

		<div class="pt-2">
			<a href="/" class="inline-block text-primary font-bold text-sm">
				<i class="fas fa-arrow-left mr-1"></i> Back to GasTrack
			</a>
		</div>
	</article>
</div>
