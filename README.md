ZoomGrid
========

ZoomGrid is a grid which can zoom its cells. In other words, it's a
two-dimensional accordion menu inside a fixed rectangle.

How to use
----------

Copy ZoomGrid.js (along with any optional extension) into your web folder
and add a corresponding &lt;script/&gt; tag for each file to the
&lt;head/&gt; element of your page:

	<script type="text/javascript"
		src="path/to/ZoomGrid.js"></script>
	<script type="text/javascript"
		src="path/to/ZoomGridTransparency.js"></script>

Then invoke the grid:

	var z = new ZoomGrid(
		{ container: document.getElementById( "Contents" ) } );

In this case, you should have a &lt;div id="Contents"/&gt; somewhere on your
page, of course. After that, you need to activate the extensions you want
to use. For example, to activate the transparency extension do:

	z.addTransparency();

Some extensions may require attributes. Just look at the corresponding
source file.
