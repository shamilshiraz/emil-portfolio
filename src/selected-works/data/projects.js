/*
 * EDIT YOUR PROJECTS HERE.
 *
 *  name, year               → title and the "( ’25 )" next to it in the detail panel
 *  a                        → the description under the title
 *  scope                    → text under the SCOPE label
 *  collaborators            → list of 'Name, role' lines (label is hidden when empty)
 *  service, client          → text under SERVICE / CLIENT
 *  link                     → optional, e.g. 'https://…'
 *  image                    → poster used on the carousel cloth
 *  accent                   → colour of the details panel on the detail page (text colour is picked automatically)
 *  gallery                  → optional list of up to 8 photo URLs (empty tiles are shown until you add them)
 *  bg                       → fallback colour if the image fails to load
 */
import bermito from '../assets/posters/bermito.png';
import dohman from '../assets/posters/dohman.png';
import nustate from '../assets/posters/nustate.png';
import palmHeritage from '../assets/posters/palm_heritage.png';
import subspace from '../assets/posters/subspace.png';
import subtle from '../assets/posters/subtle.png';

const PLACEHOLDER_A = 'Short summary of the project goes here: the brief, the idea and what you made.';
const PLACEHOLDER_SCOPE = 'What the project was and what you contributed to it.';

export const projects = [
  { name: 'Bermito',       image: bermito,      bg: '#3d3500', accent: '#ffe016' },
  { name: 'Dohman',        image: dohman,       bg: '#0d2b3d', accent: '#7ecfff' },
  { name: 'Nustate',       image: nustate,      bg: '#3a1500', accent: '#fb6a12' },
  { name: 'Palm Heritage', image: palmHeritage, bg: '#14090b', accent: '#c4633f' },
  {
    name: 'Subspace', image: subspace, bg: '#2a0a1a', accent: '#c4694d', year: '’25',
    a: 'Subspace is an experimental platform where music, architecture, and community converge. It is not tied to a single venue but designed as a roaming frequency that redefines how sound is experienced. Each activation transforms its environment into an instrument, creating temporary spaces where people, space, and resonance connect. More than an event, Subspace is a living system, a shared circuit for those seeking deeper, immersive encounters with sound.',
    scope: 'Subspace 37m² began with a simple idea: turning the limitations of a physical space into the foundation of an event concept. I contributed to shaping its identity from the ground up, developing the name and its underlying narrative around the 37-square-metre venue that hosted the first edition. Beyond naming, I was involved in curating the experience, coordinating its execution, and contributing to the visual identity at CURB Studio, helping translate the initial concept into a cohesive event experience.',
    collaborators: ['Manshad CV, owner', 'Pookutti, photo', 'Moosa Rizwi, designer'],
    service: 'Brand Strategy & Creative Direction',
    client: 'Subspace',
  },
  { name: 'Subtle',        image: subtle,       bg: '#15151a', accent: '#0a45c2' },
].map((p) => ({
  year: '’XX',
  a: PLACEHOLDER_A,
  scope: PLACEHOLDER_SCOPE,
  collaborators: [],
  service: 'Service',
  client: 'Client',
  link: '',
  gallery: [],
  ...p,
}));
