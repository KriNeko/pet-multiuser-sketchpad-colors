
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

<style>
#floatingCirclesG{
position:relative;
width:128px;
height:128px;
transform:scale(0.6);
}

.f_circleG{
position:absolute;
background-color:#FFFFFF;
height:23px;
width:23px;
border-radius:12px;
animation-name:f_fadeG;
animation-duration:0.96s;
animation-iteration-count:infinite;
animation-direction:normal;
}

#frotateG_01{
left:0;
top:52px;
animation-delay:0.36s;
}

#frotateG_02{
left:15px;
top:15px;
animation-delay:0.48s;
}

#frotateG_03{
left:52px;
top:0;
animation-delay:0.6s;
}

#frotateG_04{
right:15px;
top:15px;
animation-delay:0.72s;
}

#frotateG_05{
	right:0;
	top:52px;
	animation-delay:0.84s;
}

#frotateG_06{
	right:15px;
	bottom:15px;
	animation-delay:0.96s;
}

#frotateG_07 {
	left:52px;
	bottom:0;
	animation-delay:1.08s;
}

#frotateG_08 {
	left:15px;
	bottom:15px;
	animation-delay:1.2s;
}

@keyframes f_fadeG{
	0% { background-color:#000000 }
	100% { background-color:#FFFFFF }
}

</style>

