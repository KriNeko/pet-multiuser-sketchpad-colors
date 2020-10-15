<style>
#floatingCirclesG{
position:relative;
width:14px;
height:14px;
transform:scale(0.6);
}

.f_circleG{
position:absolute;
background-color:#FFFFFF;
height:3px;
width:3px;
border-radius:1px;
animation-name:f_fadeG;
animation-duration:0.96s;
animation-iteration-count:infinite;
animation-direction:normal;
}

#frotateG_01{
left:0;
top:6px;
animation-delay:0.36s;
}

#frotateG_02{
left:2px;
top:2px;
animation-delay:0.48s;
}

#frotateG_03{
left:6px;
top:0;
animation-delay:0.6s;
}

#frotateG_04{
right:2px;
top:2px;
animation-delay:0.72s;
}

#frotateG_05{
right:0;
top:6px;
animation-delay:0.84s;
}

#frotateG_06{
right:2px;
bottom:2px;
animation-delay:0.96s;
}

#frotateG_07{
left:6px;
bottom:0;
animation-delay:1.08s;
}

#frotateG_08{
left:2px;
bottom:2px;
animation-delay:1.2s;
}

@keyframes f_fadeG{
0%{
background-color:#000000}

100%{
background-color:#FFFFFF}

}

</style>
<div id="floatingCirclesG">
<div class="f_circleG" id="frotateG_01">
</div>
<div class="f_circleG" id="frotateG_02">
</div>
<div class="f_circleG" id="frotateG_03">
</div>
<div class="f_circleG" id="frotateG_04">
</div>
<div class="f_circleG" id="frotateG_05">
</div>
<div class="f_circleG" id="frotateG_06">
</div>
<div class="f_circleG" id="frotateG_07">
</div>
<div class="f_circleG" id="frotateG_08">
</div>
</div>