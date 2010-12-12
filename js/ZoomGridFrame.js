/*
 *   O         ,-
 *  ° o    . -´  '     ,-
 *   °  .´        ` . ´,´
 *     ( °   ))     . (
 *      `-;_    . -´ `.`.
 *          `._'       ´
 *
 * Copyright (c) 2010 Markus Fisch <mf@markusfisch.de>
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

/**
 * Total sum of frame size in horizontal and vertical direction
 *
 * @access protected
 * @var object
 */
ZoomGrid.prototype.frameSize = { width: 16, height: 16 };

/**
 * Manage ornament frames for each cell; if no class name is given, the
 * required ornament divisions will be created; it's far better to use
 * CSS3 border-radius for rounded corners if that is appropriate
 *
 * @access public
 * @param scrollDivision - class name of inner scroll division (optional)
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addFrame = function( scrollDivision )
{
	if( scrollDivision )
	{
		for( var n = 0; n < this.cells.length; n++ )
		{
			var divs = this.cells[n].getElementsByTagName( "div" );

			for( var d = 0; d < divs.length; d++ )
				if( divs[d].className == scrollDivision )
				{
					this.cells[n].zoomGrid.frameScrollDivision = divs[d];
					break;
				}

			if( !this.cells[n].zoomGrid.frameScrollDivision )
				return false;
		}
	}
	else
	{
		/**
		 * Append list of division elements recursively to given parent
		 *
		 * @access private
		 * @param e - first parent element
		 * @param classNames - array of classes of the division to append
		 * @return innermost element
		 */
		function appendRecursively( e, classNames )
		{
			for( var c = 0, first = e; c < classNames.length; c++ )
			{
				var d = document.createElement( "div" );
				d.className = classNames[c];
				e.appendChild( d );
				e = d;
			}

			return e;
		}

		for( var n = 0; n < this.cells.length; n++ )
		{
			var frameDiv = this.cells[n];
			var className = frameDiv.className;
			var innerHTML = frameDiv.innerHTML;
			var e;

			frameDiv.innerHTML = "";
			frameDiv.className = "Frame";

			appendRecursively( frameDiv, ["TopLeft", "TopRight"] );
			e = appendRecursively( frameDiv, ["Left", "Right", className] );
			appendRecursively( frameDiv, ["BottomLeft", "BottomRight"] );

			if( e )
			{
				e.innerHTML = innerHTML;
				this.cells[n].zoomGrid.frameScrollDivision = e;
			}
		}
	}

	this.adjustScrollDivision();

	/**
	 * Called before moving begins
	 *
	 * @access protected
	 */
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
		this.active.zoomGrid.frameScrollDivision.scrollLeft = "0px";
		this.active.zoomGrid.frameScrollDivision.scrollTop = "0px";

		var oldActive = this.active;
		this.active = this.active.zoomGrid.frameScrollDivision;
		this.frameOldStartMove();
		this.active = oldActive;
	}

	/**
	 * Called after moving has stopped
	 *
	 * @access protected
	 */
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

	/**
	 * Called while moving
	 *
	 * @access protected
	 */
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
 *
 * @access protected
 */
ZoomGrid.prototype.adjustScrollDivision = function()
{
	// adjust height of inner scroll division
	for( var n = 0; n < this.cells.length; n++ )
		this.cells[n].zoomGrid.frameScrollDivision.style.height =
			(this.cells[n].offsetHeight-this.frameSize.height)+"px";
}
