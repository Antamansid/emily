let but = document.getElementById('but');
let par = document.getElementById('hello');

window.onload = ()=>{
  but.addEventListener('click', ()=>{
    par.textContent= 'Здарова Димасик';
    console.log('Че там?')
  })
}