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
	/** Restore button */
	ZoomGrid.prototype.restoreButton = null;

	/** Add restore button */
	ZoomGrid.prototype.addRestoreButton = function()
	{
		/** Called before moving begins */
		this.restoreButtonOldStartMove = this.startMove;
		this.startMove = function()
		{
			this.hideRestoreButton();
			this.restoreButtonOldStartMove();
		}

		/**  Called after moving has stopped */
		this.restoreButtonOldStopMove = this.stopMove;
		this.stopMove = function()
		{
			this.showRestoreButton();
			this.restoreButtonOldStopMove();
		}

		/**
		 * Add highlighting to a transparent ZoomGrid
		 *
		 * @return true on success, false otherwise
		 */
		this.restoreButtonOldAddHighlight = this.addHighlight;
		this.addHighlight = function()
		{
			this.restoreButtonOldAddHighlight();
			this.showRestoreButton();

			return true;
		}

		return true;
	}

	/**
	 * Hide button
	 */
	ZoomGrid.prototype.hideRestoreButton = function()
	{
		if( !this.restoreButton )
			this.restoreButton = this.createRestoreButton();

		this.restoreButton.style.visibility = 'hidden';
	}

	/**
	 * Show button
	 */
	ZoomGrid.prototype.showRestoreButton = function()
	{
		if( !this.zoomOnClick ||
			!this.active )
			return;

		if( !this.restoreButton )
			this.restoreButton = this.createRestoreButton();

		var x = 0,
			y = 0;

		for( var e = this.active;
			e;
			e = e.parentNode )
		{
			if( !isNaN( e.offsetLeft ) )
				x += e.offsetLeft;

			if( !isNaN( e.offsetTop ) )
				y += e.offsetTop;
		}

		this.restoreButton.style.left = x+'px';
		this.restoreButton.style.top = y+'px';
		this.restoreButton.style.visibility = 'visible';
	}

	/**
	 * Create restore button
	 */
	ZoomGrid.prototype.createRestoreButton = function()
	{
		var a = document.createElement( 'a' ),
			d = document.createElement( 'div' );

		a.className = 'ZoomGridRestoreButton';
		a.href = '#';
		a.innerHTML = 'Close';

		var t = this;
		a.onclick = function()
		{
			t.hideRestoreButton();
			t.restore();

			return false;
		}

		d.style.position = 'absolute';
		d.style.left = '0';
		d.style.top = '0';
		d.style.zIndex = '1';
		d.style.visibility = 'hidden';
		d.appendChild( a );

		// add to body
		{
			var b = document.getElementsByTagName( 'body' );

			if( !b ||
				!b.length )
				return;

			b[0].appendChild( d );
		}

		return d;
	}
})();
