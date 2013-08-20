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
"use strict";

/** Total sum of frame size in horizontal and vertical direction */
ZoomGrid.prototype.frameSize = { width: 16, height: 16 };

/**
 * Manage ornament frames for each cell; if no class name is given, the
 * required ornament divisions will be created; it's far better to use
 * CSS3 border-radius for rounded corners if that is appropriate
 *
 * @param scrollDivision - class name of inner scroll division (optional)
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addFrame = function( scrollDivision )
{
	if( scrollDivision )
	{
		for( var n = this.cells.length; n--; )
		{
			var c = this.cells[n],
				divs = c.getElementsByTagName( 'div' );

			for( var d = divs.length; d--; )
				if( divs[d].className == scrollDivision )
				{
					c.zoomGrid.frameScrollDivision = divs[d];
					break;
				}

			if( !c.zoomGrid.frameScrollDivision )
				return false;
		}
	}
	else
	{
		/**
		 * Append list of division elements recursively to given parent
		 *
		 * @param e - first parent element
		 * @param classNames - array of classes of the division to append
		 * @return innermost element
		 */
		function appendRecursively( e, classNames )
		{
			for( var c = 0, l = classNames.length; c < l; ++c )
			{
				var d = document.createElement( 'div' );
				d.className = classNames[c];
				e.appendChild( d );
				e = d;
			}

			return e;
		}

		for( var n = this.cells.length; n--; )
		{
			var frameDiv = this.cells[n],
				className = frameDiv.className,
				innerHTML = frameDiv.innerHTML,
				e;

			frameDiv.innerHTML = '';
			frameDiv.className = 'Frame';

			appendRecursively( frameDiv, ['TopLeft', 'TopRight'] );
			e = appendRecursively( frameDiv, ['Left', 'Right', className] );
			appendRecursively( frameDiv, ['BottomLeft', 'BottomRight'] );

			if( e )
			{
				e.innerHTML = innerHTML;
				frameDiv.zoomGrid.frameScrollDivision = e;
			}
		}
	}

	this.adjustScrollDivision();

	/** Called before moving begins */
	this.frameOldStartMove = this.startMove;
	this.startMove = function()
	{
		if( !this.active ||
			!this.active.zoomGrid ||
			!this.active.zoomGrid.frameScrollDivision )
		{
			this.frameOldStartMove();
			return;
		}

		// scroll back
		this.active.zoomGrid.frameScrollDivision.scrollLeft = '0px';
		this.active.zoomGrid.frameScrollDivision.scrollTop = '0px';

		var oldActive = this.active;
		this.active = this.active.zoomGrid.frameScrollDivision;
		this.frameOldStartMove();
		this.active = oldActive;
	}

	/** Called after moving has stopped */
	this.frameOldStopMove = this.stopMove;
	this.stopMove = function()
	{
		if( !this.active ||
			!this.active.zoomGrid ||
			!this.active.zoomGrid.frameScrollDivision )
		{
			this.frameOldStopMove();
			return;
		}

		var oldActive = this.active;
		this.active = this.active.zoomGrid.frameScrollDivision;
		this.frameOldStopMove();
		this.active = oldActive;
	}

	/** Called while moving */
	this.frameOldMoving = this.moving;
	this.moving = function()
	{
		this.frameOldMoving();
		this.adjustScrollDivision();
	}

	return true;
}

/**
 * Adjust inner frame divisions
 */
ZoomGrid.prototype.adjustScrollDivision = function()
{
	// adjust height of inner scroll division
	for( var n = this.cells.length; n--; )
	{
		var c = this.cells[n];
		c.zoomGrid.frameScrollDivision.style.height =
			(c.offsetHeight-this.frameSize.height)+'px';
	}
}
