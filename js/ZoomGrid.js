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
(function(){
	/**
	 * Contruct a grid which can zoom its cells
	 *
	 * @param properties - property list in JSON format (optional)
	 */
	function ZoomGrid( properties )
	{
		/** Number of columns */
		this.columns = 0;

		/** Number of rows */
		this.rows = 0;

		/** Zoom on click or mouse over */
		this.zoomOnClick = false;

		/** Width and height of folded cells */
		this.foldedSize = { width: 0, height: 0 };

		/**
		 * Total sum of all padding, margin and border in
		 * horizontal and vertical direction; for example:
		 * left + right margin + border width*2 + left + right padding
		 */
		this.paddingMarginBorder = { width: 0, height: 0 };

		/** Time out in miliseconds */
		this.timeout = 50;

		/** Tag name of child element that should become a cell */
		this.tagName = 'DIV';

		/** Container element */
		this.container = null;

		/** Array of cells */
		this.cells = [];

		/** Currently focused cell */
		this.active = 0;

		/** Move timer */
		this.moveTimer = 0;

		// assign JSON property list
		if( properties )
		{
			this.assignProperties( properties );

			if( this.container )
				this.create( this.container );
		}
	}

	/**
	 * Create zooming grid
	 *
	 * @param container - container element
	 */
	ZoomGrid.prototype.create = function( container )
	{
		if( !container )
			return;

		if( container.style.position != 'absolute' )
			container.style.position = 'relative';

		this.container = container;

		for( var n = 0, l = container.childNodes.length; n < l; ++n )
		{
			var c = container.childNodes[n];

			if( c.tagName != this.tagName )
				continue;

			this.cells[this.cells.length] = c;
		}

		if( !this.cells.length )
			return;

		if( this.columns > 0 )
		{
			if( isNaN( this.rows ) ||
				this.rows < 1 )
				this.rows = Math.round( this.cells.length/this.columns );
		}
		else if( this.rows > 0 )
			this.columns = this.cells.length;
		else
			this.columns = this.rows =
				Math.round( Math.sqrt( this.cells.length ) );

		if( this.columns+this.rows < 2 )
			return;

		while( this.columns*this.rows < this.cells.length )
			++this.columns;

		for( var n = this.cells.length; n--; )
		{
			var c = this.cells[n];

			c.zoomGrid = { zoomGrid: this };
			c.style.position = 'absolute';
			c.style.overflow = 'hidden';

			if( this.zoomOnClick )
				c.onclick = this.enterCell;
			else
				c.onmouseover = this.enterCell;
		}

		container.zoomGrid = { zoomGrid: this };

		if( !this.zoomOnClick )
			container.onmouseout = this.leaveContainer;

		if( !this.foldedSize.width ||
			!this.foldedSize.height )
		{
			// calculate size of folded cells to leave 80% to focused cell
			this.foldedSize.width =
				this.columns > 1 ?
					Math.round( this.container.offsetWidth*.2/(this.columns-1) ) :
					0;

			this.foldedSize.height =
				this.rows > 1 ?
					Math.round( this.container.offsetHeight*.2/(this.rows-1) ) :
					0;
		}

		this.restore( true );
	}

	/**
	 * Method to call when mouse left container
	 *
	 * @param ev - mouse event
	 */
	ZoomGrid.prototype.leaveContainer = function( ev )
	{
		var z;

		if( !this.zoomGrid ||
			!(z = this.zoomGrid.zoomGrid) )
			return;

		// ignore events from child elements
		if( ev ||
			(ev = window.event) )
			for( var t = ev.relatedTarget ? ev.relatedTarget : ev.toElement;
				t;
				t = t.parentNode )
				if( t == z.container )
					return;

		z.restore();
	}

	/**
	 * Method to call when mouse enters some cell
	 *
	 * @param ev - mouse event
	 */
	ZoomGrid.prototype.enterCell = function( ev )
	{
		var z;

		if( !this.zoomGrid ||
			!(z = this.zoomGrid.zoomGrid) )
			return;

		// ignore events from child elements
		if( z.active == this )
			return;

		z.zoom( this );
	}

	/**
	 * Restore view
	 *
	 * @param setup - true if cells should be set up directly (optional)
	 */
	ZoomGrid.prototype.restore = function( setup )
	{
		var w = Math.round( this.container.offsetWidth/this.columns ),
			h = Math.round( this.container.offsetHeight/this.rows ),
			x = 0,
			y = 0,
			col = 0;

		this.clearMoveTimer();
		this.startMove();

		this.active = 0;

		for( var n = 0, l = this.cells.length; n < l; ++n )
		{
			var c = this.cells[n];

			c.zoomGrid.left = x;
			c.zoomGrid.top = y;
			c.scrollLeft = '0px';
			c.scrollTop = '0px';

			// this values are for sub classes only
			c.zoomGrid.targetWidth = w;
			c.zoomGrid.targetHeight = h;

			if( setup )
			{
				c.style.left = c.zoomGrid.left+'px';
				c.style.top = c.zoomGrid.top+'px';
				c.style.width =
					(w-this.paddingMarginBorder.width)+'px';
				c.style.height =
					(h-this.paddingMarginBorder.height)+'px';
			}

			x += w;

			if( ++col >= this.columns )
			{
				x = 0;
				y += h;
				col = 0;
			}
		}

		if( setup )
			return;

		var t = this;
		this.moveTimer = setTimeout(
			function(){ t.move(); },
			this.timeout );
	}

	/**
	 * Zoom cell
	 *
	 * @param e - element in question
	 */
	ZoomGrid.prototype.zoom = function( e )
	{
		var cellWidth = 0,
			cellHeight = 0,
			focusedWidth = 0,
			focusedHeight = 0,
			focusedColumn = -1,
			focusedRow = -1;

		this.clearMoveTimer();
		this.startMove();

		this.active = 0;

		// calculate width and height of focused and unfocused cells
		{
			var columnsLeft = this.columns-1,
				rowsLeft = this.rows-1;

			cellWidth = this.foldedSize.width;
			cellHeight = this.foldedSize.height;
			focusedWidth = Math.round(
				this.container.offsetWidth-(columnsLeft*cellWidth) );
			focusedHeight = Math.round(
				this.container.offsetHeight-(rowsLeft*cellHeight) );
		}

		// determine focused column and row
		{
			var col = 0,
				row = 0;

			for( var n = 0, l = this.cells.length; n < l; ++n )
			{
				if( this.cells[n] == e )
				{
					this.active = e;
					focusedColumn = col;
					focusedRow = row;
					break;
				}

				if( ++col >= this.columns )
				{
					col = 0;
					++row;
				}
			}
		}

		// now lay out cells
		{
			var x = 0,
				y = 0,
				col = 0,
				row = 0;

			for( var n = 0, l = this.cells.length; n < l; ++n )
			{
				var c = this.cells[n],
					w = (col == focusedColumn ? focusedWidth : cellWidth),
					h = (row == focusedRow ? focusedHeight : cellHeight);

				c.zoomGrid.left = x;
				c.zoomGrid.top = y;
				c.scrollLeft = '0px';
				c.scrollTop = '0px';

				// this values are for sub classes only
				c.zoomGrid.targetWidth = w;
				c.zoomGrid.targetHeight = h;

				x += w;

				if( ++col >= this.columns )
				{
					x = 0;
					y += h;
					col = 0;
					++row;
				}
			}
		}

		var t = this;
		this.moveTimer = setTimeout(
			function(){ t.move(); },
			this.timeout );
	}

	/**
	 * Called before moving begins
	 */
	ZoomGrid.prototype.startMove = function()
	{
		if( !this.active )
			return;

		this.active.style.overflow = 'hidden';
	}

	/**
	 * Called while moving
	 */
	ZoomGrid.prototype.moving = function()
	{
	}

	/**
	 * Called after moving has stopped
	 */
	ZoomGrid.prototype.stopMove = function()
	{
		if( !this.active )
			return;

		this.active.style.overflow = 'auto';
	}

	/**
	 * Move cells
	 */
	ZoomGrid.prototype.move = function()
	{
		var touched = false;

		// set horizontal positions
		for( var col = 0, n = 0, l = this.columns-1;
			col < this.columns;
			++col, ++n )
		{
			var c = this.cells[n],
				d;

			if( (d = c.zoomGrid.left-c.offsetLeft) != 0 )
			{
				var s;

				if( !(s = this.calculateStep( d )) )
				{
					this.setStack(
						n,
						this.columns,
						this.rows,
						'left',
						c.zoomGrid.left+'px' );
				}
				else
				{
					this.setStack(
						n,
						this.columns,
						this.rows,
						'left',
						(c.offsetLeft+s)+'px' );

					touched = true;
				}
			}

			if( n > 0 )
			{
				var last = n-1;

				this.setStack(
					last,
					this.columns,
					this.rows,
					'width',
					(c.offsetLeft-
						this.cells[last].offsetLeft-
						this.paddingMarginBorder.width)+'px' );
			}

			if( col >= l )
				this.setStack(
					n,
					this.columns,
					this.rows,
					'width',
					(this.container.offsetWidth-
						c.offsetLeft-
						this.paddingMarginBorder.width)+'px' );
		}

		// set vertical positions
		for( var row = 0, n = 0, l = this.rows-1, cl = this.cells.length;
			row < this.rows;
			++row, n += this.columns )
		{
			if( n >= cl )
				break;

			var c = this.cells[n],
				d;

			if( (d = c.zoomGrid.top-c.offsetTop) != 0 )
			{
				var s;

				if( !(s = this.calculateStep( d )) )
				{
					this.setStack(
						n,
						1,
						this.columns,
						'top',
						c.zoomGrid.top+'px' );
				}
				else
				{
					this.setStack(
						n,
						1,
						this.columns,
						'top',
						(c.offsetTop+s)+'px' );

					touched = true;
				}
			}

			if( n > 0 )
			{
				var last = n-this.columns;

				this.setStack(
					last,
					1,
					this.columns,
					'height',
					(c.offsetTop-
						this.cells[last].offsetTop-
						this.paddingMarginBorder.height)+'px' );
			}

			if( row == l ||
				n+this.columns >= cl )
				this.setStack(
					n,
					1,
					this.columns,
					'height',
					(this.container.offsetHeight-
						c.offsetTop-
						this.paddingMarginBorder.height)+'px' );
		}

		this.moving();

		if( !touched )
		{
			this.clearMoveTimer();
			this.stopMove();

			return;
		}

		var t = this;
		this.moveTimer = setTimeout(
			function(){ t.move(); },
			this.timeout );
	}

	/**
	 * Calculate amount to get closer at a time
	 *
	 * @param d - distance in pixels
	 */
	ZoomGrid.prototype.calculateStep = function( d )
	{
		var f = Math.round( d/2 );

		if( Math.abs( f ) < 8 )
			f = 0;

		return f;
	}

	/**
	 * Assign JSON properties
	 *
	 * @param properties - property list in JSON format
	 */
	ZoomGrid.prototype.assignProperties = function( properties )
	{
		for( var name in properties )
			this[name] = properties[name];
	}

	/**
	 * Parse given array of element patterns
	 *
	 * @param patterns - array of tag names with optional class (.) or id (#) name
	 * @return array of pattern objects
	 */
	ZoomGrid.prototype.parsePatterns = function( patterns )
	{
		var pat = [];

		for( var i = 0, l = patterns.length; i < l; ++i )
		{
			var p,
				pi = patterns[i];

			if( (p = pi.indexOf( '.' )) > -1 )
			{
				var t = pi.substr( 0, p );
				var c = pi.substr( p+1 );

				pat.push( { tagName: t, className: c } );
			}
			else if( (p = pi.indexOf( '#' )) > -1 )
			{
				var t = pi.substr( 0, p );
				var d = pi.substr( p+1 );

				pat.push( { tagName: t, id: d } );
			}
			else
				pat.push( { tagName: pi } );
		}

		return pat;
	}

	/**
	 * Set all cells of a column or row
	 *
	 * @param i - index of first cell in column or row
	 * @param s - number of elements to skip to get to the next element
	 * @param m - elements in column or row
	 * @param p - property name
	 * @param v - new value
	 */
	ZoomGrid.prototype.setStack = function( i, s, m, p, v )
	{
		for( var n = i, l = this.cells.length;
			m > 0;
			n += s, --m )
		{
			if( n >= l )
				return;

			this.cells[n].style[p] = v;
		}
	}

	/**
	 * Clear timer
	 */
	ZoomGrid.prototype.clearMoveTimer = function()
	{
		clearTimeout( this.moveTimer );
		this.moveTimer = 0;
	}

	window.ZoomGrid = ZoomGrid;
})();
