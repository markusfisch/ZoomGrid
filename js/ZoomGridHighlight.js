/*
 *   O         ,-
 *  ° o    . -´  '     ,-
 *   °  .´        ` . ´,´
 *     ( °   ))     . (
 *      `-;_    . -´ `.`.
 *          `._'       ´
 *
 * 2010,2012 Markus Fisch <mf@markusfisch.de>
 * Public Domain
 */
(function(){
	/** Opacity of highlighted cell */
	ZoomGrid.prototype.opacityHighlighted = .75;

	/**
	 * Add highlighting to a transparent ZoomGrid
	 *
	 * @return true on success, false otherwise
	 */
	ZoomGrid.prototype.addHighlight = function()
	{
		// check if instance has transparency extension
		if( !this.opacityFocused )
			return false;

		// highlight makes only sense when cells must be clicked
		this.zoomOnClick = true;
		this.container.onmouseout = null;

		// remove leaveContainer on parent node
		{
			var e = this.container.parentNode;

			if( !e )
				e = this.container.parentElement;

			e.onclick = this.leaveContainer;
		}

		for( var n = this.cells.length; n--; )
		{
			var c = this.cells[n];
			c.onclick = this.enterCell;
			c.onmouseover = this.highlightCell;
			c.onmouseout = this.dimCell;
		}

		return true;
	}

	/**
	 * Add highlighting as soon as a cell was clicked
	 *
	 * @return true on success, false otherwise
	 */
	ZoomGrid.prototype.addHighlightOnClick = function()
	{
		if( this.zoomOnClick )
			return false;

		for( var n = this.cells.length; n--; )
			this.cells[n].onclick = this.addHighlightToCell;

		this.highlightOldRestore = this.restore;
		this.restore = function()
		{
			if( this.zoomOnClick )
			{
				this.zoomOnClick = false;
				this.container.onmouseout = this.leaveContainer;

				for( var n = this.cells.length; n--; )
				{
					var c = this.cells[n];
					c.onclick = this.addHighlightToCell;
					c.onmouseover = this.enterCell;
				}
			}

			this.highlightOldRestore();
		}

		return true;
	}

	/**
	 * Highlight cell
	 *
	 * @param ev - mouse event
	 */
	ZoomGrid.prototype.highlightCell = function( ev )
	{
		var z;

		if( !this.zoomGrid ||
			!(z = this.zoomGrid.zoomGrid) ||
			z.active == this ||
			z.moveTimer )
			return;

		z.setOpacity( this, z.opacityHighlighted );
	}

	/**
	 * Dim cell to normal opacity
	 *
	 * @param ev - mouse event
	 */
	ZoomGrid.prototype.dimCell = function( ev )
	{
		// find cell division which mouse has left
		var z = null,
			left = null;

		for( var e = this;
			e;
			e = e.parentNode )
			if( e.zoomGrid )
			{
				left = e;
				break;
			}

		if( !left ||
			!(z = left.zoomGrid.zoomGrid) ||
			z.active == this ||
			z.moveTimer )
			return;

		// find cell division which mouse has entered
		var entered = null;

		if( ev ||
			(ev = window.event) )
		{
			// try/catch because of Firefox' "permission denied error"
			// see http://code.google.com/p/fbug/issues/detail?id=2075
			// for details
			try
			{
				for( var e = ev.relatedTarget ? ev.relatedTarget : ev.toElement;
					e;
					e = e.parentNode )
					if( e.zoomGrid )
					{
						entered = e;
						break;
					}
			}
			catch( err )
			{
			}
		}

		if( left == entered )
			return;

		z.setOpacity( left, z.active ? z.opacityFolded : z.opacityUnfocused );
	}

	/**
	 * Add highlighting calling cell
	 *
	 * @param ev - mouse event
	 */
	ZoomGrid.prototype.addHighlightToCell = function( ev )
	{
		var z;

		if( !this.zoomGrid ||
			!(z = this.zoomGrid.zoomGrid) )
			return false;

		z.addHighlight();

		return true;
	}
})();
