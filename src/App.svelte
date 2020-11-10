<script lang="ts">

import {Router, routes} from 'svelte-hash-router'
import Type from './views/type.svelte'
import Stats from './views/stats.svelte'
import Tests from './views/tests.svelte'

routes.set({
    '/': Type,
    '/stats': Stats,
})

</script>

<Router></Router>

<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400&display=swap');

@import './styles/vars.scss';

:global(body)
{
	margin: 0;
    background-color: $color-bg;
    color: $color-text;
    font-family: 'Raleway', sans-serif;
    font-size: 22px;
}
</style>