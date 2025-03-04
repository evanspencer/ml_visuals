//DOM elements
const rfBtn = document.getElementById('randomForestBtn');
const xgbBtn = document.getElementById('xgboostBtn');
const container = document.getElementById('visualization-container');

//STATE
let isAnimating = false;
let currentViz = 'randomForest';

//CONSTANTS
const width = 700;
const height = 450;
const treeWidth = 60;
const treeHeight = 80;

// initialize visualization
initializeVisualization();

//setup event listener
rfBtn.addEventListener('click', () => {
  if (currentViz !== 'randomForest' && !isAnimating) {
    currentViz = 'randomForest';
    rfBtn.classList.add('active');
    xgbBtn.classList.remove('active');
    drawRandomForest();
  }
});

xgbBtn.addEventListener('click', () => {
  if (currentViz !== 'xgboost' && !isAnimating) {
    currentViz = 'xgboost';
    xgbBtn.classList.add('active');
    rfBtn.classList.remove('active');
    drawXGBoost();
  }
});

function initializeVisualization() {
  drawRandomForest();
}

function drawRandomForest() {
  //clearing container
  container.innerHTML = '';
  
  //create a svg
  const svg = d3.select('#visualization-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
    
  //TITLE
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .attr('font-size', '18px')
    .text('Random Forest: Parallel Independent Trees with Voting');
    
  //Dataset icon
  svg.append('rect')
    .attr('x', width / 2 - 50)
    .attr('y', 60)
    .attr('width', 100)
    .attr('height', 40)
    .attr('fill', '#4ecdc4')
    .attr('rx', 5);
    
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 85)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text('Training Data');
    
  //boostrap samples
  const bootstrapX = [120, 280, 440, 600];
  const bootstrapY = 150;
  
  bootstrapX.forEach((x, i) => {
    //bootstramp sample
    svg.append('rect')
      .attr('x', x - 30)
      .attr('y', bootstrapY - 20)
      .attr('width', 60)
      .attr('height', 40)
      .attr('fill', '#ff9500')
      .attr('fill-opacity', 0.7)
      .attr('rx', 5);
      
    svg.append('text')
      .attr('x', x)
      .attr('y', bootstrapY + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text('Sample ' + (i+1));
      
    //line from dataset to bootstrap
    svg.append('line')
      .attr('x1', width / 2)
      .attr('y1', 100)
      .attr('x2', x)
      .attr('y2', bootstrapY - 20)
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');
  });
  
  //Trees
  bootstrapX.forEach((x, i) => {
    //tree
    const treeColors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6'];
    drawTree(svg, x, 250, treeWidth, treeHeight, treeColors[i]);
    
    svg.append('text')
      .attr('x', x)
      .attr('y', 230)
      .attr('text-anchor', 'middle')
      .text('Tree ' + (i+1));
      
    //line from bootstrap to tree
    svg.append('line')
      .attr('x1', x)
      .attr('y1', bootstrapY + 20)
      .attr('x2', x)
      .attr('y2', 210)
      .attr('stroke', '#333')
      .attr('stroke-width', 1);
  });
  
  //voting box
  svg.append('rect')
    .attr('x', width / 2 - 100)
    .attr('y', 350)
    .attr('width', 200)
    .attr('height', 50)
    .attr('fill', '#9b59b6')
    .attr('rx', 5);
    
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 380)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text('Majority Voting');
    
  //line going from tree to voting
  bootstrapX.forEach(x => {
    svg.append('line')
      .attr('x1', x)
      .attr('y1', 310)
      .attr('x2', width / 2)
      .attr('y2', 350)
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrowhead)');
  });
  
  //arrow marker
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#333');
    
//key feature callouts 
const features = [
    { 
      x: 80, 
      y: 50, 
      text: 'Random Subsampling (Bagging)', 
      tooltip: 'Bootstrap Aggregating (Bagging): Creating multiple datasets by randomly sampling with replacement from original data, allowing each tree to train on a different subset.'
    },
    { 
      x: 60, 
      y: 190, 
      text: 'Feature Randomness at Each Split', 
      tooltip: 'Each decision tree considers only a random subset of features when deciding how to split nodes, increasing diversity among trees.'
    },
    { 
      x: 80, 
      y: 370, 
      text: 'Parallel Training', 
      tooltip: 'All trees are trained independently and simultaneously, making Random Forest easily parallelizable and faster to train.'
    },
    { 
      x: 550, 
      y: 370, 
      text: 'Equal Voting Weight', 
      tooltip: 'Each tree\'s prediction has the same importance in the final decision, typically using majority vote for classification.'
    }
  ];
  
  features.forEach(f => {
    // froup for text and tooltip
    const tooltipGroup = svg.append('g')
      .attr('class', 'tooltip-group');
    
    //add text with cursor indicator
    tooltipGroup.append('text')
      .attr('x', f.x)
      .attr('y', f.y)
      .attr('text-anchor', 'start')
      .attr('font-size', '12px')
      .attr('font-style', 'italic')
      .attr('fill', '#555')
      .attr('cursor', 'help')
      .text(f.text);
    
    //invisible rectangle for better hover area
    const textNode = tooltipGroup.select('text').node();
    const textWidth = textNode ? textNode.getComputedTextLength() : 200;
    
    tooltipGroup.append('rect')
      .attr('x', f.x)
      .attr('y', f.y - 12)
      .attr('width', textWidth)
      .attr('height', 16)
      .attr('fill', 'transparent')
      .attr('cursor', 'help');
    
    // add tooltip box (initially hidden)
    const tooltip = tooltipGroup.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .attr('pointer-events', 'none');
    
    //background for tooltip
    tooltip.append('rect')
      .attr('x', f.x)
      .attr('y', f.y - 5)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 220)
      .attr('height', 70)
      .attr('fill', '#333')
      .attr('opacity', 0.9);
    
    //tooltip text
    tooltip.append('text')
      .attr('x', f.x + 10)
      .attr('y', f.y + 15)
      .attr('width', 200)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .text(function() {
        return f.tooltip;
      })
      .call(wrap, 200);
    
    // adding mouseover events
    tooltipGroup.on('mouseover', function() {
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
    }).on('mouseout', function() {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });
  });
  
  // animation delay
  setTimeout(() => animateRandomForest(svg), 500);
}

function animateRandomForest(svg) {
  isAnimating = true;
  
  // define bootstrapY if it's not accessible from the outer scope
  const bootstrapY = 150; // matches the value from drawRandomForest
  
  // adding a pause before animation starts
  setTimeout(() => {
    // animating with grow and shrink effect
    svg.selectAll('rect')
      .filter(function() {
        // select only bootstrap sample rectangles by their Y position and color
        const y = parseFloat(d3.select(this).attr('y'));
        const fill = d3.select(this).attr('fill');
        return Math.abs(y - (bootstrapY - 20)) < 5 && fill === '#ff9500';
      })
      .each(function() {
        //get each rectangle's current position and size
        const rect = d3.select(this);
        const x = parseFloat(rect.attr('x'));
        const y = parseFloat(rect.attr('y'));
        const width = parseFloat(rect.attr('width'));
        const height = parseFloat(rect.attr('height'));
        
        //calculate center point
        const centerX = x + width/2;
        const centerY = y + height/2;
        
        //animate growing from center
        rect.transition()
          .duration(700)
          .attr('x', centerX - width*0.55) // growing by 10^
          .attr('y', centerY - height*0.55) 
          .attr('width', width * 1.1)
          .attr('height', height * 1.1)
          .transition()
          .duration(700)
          .attr('x', x) // return to original size
          .attr('y', y)
          .attr('width', width)
          .attr('height', height);
      });
    
    //animate specific decision paths within trees
    setTimeout(() => {  
      //for each tree, animate a specific path to show decision making
      const bootstrapX = [120, 280, 440, 600]; //match the values from drawRandomForest
      
      //define a sample path for each tree (will vary per tree)
      const paths = [
        {root: 0, branch: 'left', leaf: 'right'}, //first tree
        {root: 0, branch: 'right', leaf: 'left'}, //second tree
        {root: 0, branch: 'left', leaf: 'left'},  //third tree
        {root: 0, branch: 'right', leaf: 'right'} //fourth tree
      ];
      
      //animate all trees in parallel, but with specific paths for each
      bootstrapX.forEach((x, i) => {
        const path = paths[i];
        
        //root node
        setTimeout(() => {
          svg.selectAll('circle')
            .filter(function() {
              const cx = parseFloat(d3.select(this).attr('cx'));
              const cy = parseFloat(d3.select(this).attr('cy'));
              return Math.abs(cx - x) < 5 && cy < 260; 
            })
            .transition()
            .duration(500) 
            .attr('r', function() {
              return parseFloat(d3.select(this).attr('r')) * 1.3;
            })
            .transition()
            .duration(500)
            .attr('r', function() {
              return parseFloat(d3.select(this).attr('r')) / 1.3;
            });
        }, 0);
        
        //branch node (left or right based on path)
        setTimeout(() => {
          const branchOffset = path.branch === 'left' ? -treeWidth/3 : treeWidth/3;
          svg.selectAll('circle')
            .filter(function() {
              const cx = parseFloat(d3.select(this).attr('cx'));
              const cy = parseFloat(d3.select(this).attr('cy'));
              return Math.abs(cx - (x + branchOffset)) < 5 && cy > 260 && cy < 300;
            })
            .transition()
            .duration(500)
            .attr('r', function() {
              return parseFloat(d3.select(this).attr('r')) * 1.3;
            })
            .transition()
            .duration(500)
            .attr('r', function() {
              return parseFloat(d3.select(this).attr('r')) / 1.3;
            });
        }, 700); 
        
        //leaf node (relative to chosen branch)
        setTimeout(() => {
          let leafOffset;
          if (path.branch === 'left') {
            leafOffset = path.leaf === 'left' ? -treeWidth/2 : -treeWidth/6;
          } else {
            leafOffset = path.leaf === 'left' ? treeWidth/6 : treeWidth/2;
          }
          
          svg.selectAll('circle')
            .filter(function() {
              const cx = parseFloat(d3.select(this).attr('cx'));
              const cy = parseFloat(d3.select(this).attr('cy'));
              return Math.abs(cx - (x + leafOffset)) < 5 && cy > 300;
            })
            .transition()
            .duration(500) 
            .attr('r', function() {
              return parseFloat(d3.select(this).attr('r')) * 1.3;
            })
            .transition()
            .duration(500) 
            .attr('r', function() {
              return parseFloat(d3.select(this).attr('r')) / 1.3;
            });
        }, 1400); 
      });
    }, 1200); 
    
    //animate the majority voting container
    setTimeout(() => {
      const votingRect = svg.selectAll('rect')
        .filter(function() {
          const y = parseFloat(d3.select(this).attr('y'));
          const fill = d3.select(this).attr('fill');
          return Math.abs(y - 350) < 10 && fill === '#9b59b6';
        });
      
      //each function on the voting rectangle
      votingRect.each(function() {
        const rect = d3.select(this);
        const x = parseFloat(rect.attr('x'));
        const y = parseFloat(rect.attr('y'));
        const width = parseFloat(rect.attr('width'));
        const height = parseFloat(rect.attr('height'));
        //center point calculation
        const centerX = x + width/2;
        const centerY = y + height/2;
        
        //animate growth from center
        rect.transition()
          .duration(600) 
          .attr('x', centerX - width*0.55) 
          .attr('y', centerY - height*0.55) 
          .attr('width', width * 1.1)
          .attr('height', height * 1.1)
          .attr('fill', '#e74c3c')
          .transition()
          .duration(600) 
          .attr('x', x)
          .attr('y', y)
          .attr('width', width)
          .attr('height', height)
          .attr('fill', '#9b59b6');
      });
      
      isAnimating = false;
    }, 3000);
  }, 300);
}

function drawXGBoost() {
  container.innerHTML = '';
  
  const svg = d3.select('#visualization-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .attr('font-size', '18px')
    .text('XGBoost: Sequential Trees Focusing on Errors');
    
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 50)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-style', 'italic')
    .text('Focus on Misclassified Examples');
  
  svg.append('rect')
    .attr('x', 100)
    .attr('y', 140)
    .attr('width', 100)
    .attr('height', 40)
    .attr('fill', '#4ecdc4')
    .attr('rx', 5);
    
  svg.append('text')
    .attr('x', 150)
    .attr('y', 165)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text('Training Data');
  
  //weak learners sequence
  const treeStartX = 250;
  const treeGap = 160;
  const treeY = 140;
  
  //tree titles
  for (let i = 0; i < 3; i++) {
    const treeX = treeStartX + i * treeGap;
    
    svg.append('text')
      .attr('x', treeX)
      .attr('y', 90)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text(`Weak Learner ${i+1}`);
  }
  
  //draw trees in sequence with errors flowing through
  const treeColors = ['#3498db', '#2ecc71', '#e74c3c'];
  const weights = [0.3, 0.5, 0.2];
  
  for (let i = 0; i < 3; i++) {
    const treeX = treeStartX + i * treeGap;
    
    //tree
    drawTree(svg, treeX, treeY, treeWidth, treeHeight, treeColors[i]);
    
    svg.append('text')
      .attr('x', treeX)
      .attr('y', treeY + treeHeight + -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#555')
      .text(`Weight: ${weights[i]}`);
    
    //connecting lines
    if (i === 0) {
      svg.append('line')
        .attr('x1', 200)
        .attr('y1', 140)
        .attr('x2', treeX - treeWidth/2)
        .attr('y2', treeY)
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5)
        .attr('marker-end', 'url(#arrowhead)');
    } else {
      svg.append('line')
        .attr('x1', treeX - treeGap + treeWidth/2)
        .attr('y1', treeY)
        .attr('x2', treeX - treeWidth/2)
        .attr('y2', treeY)
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,3')
        .attr('marker-end', 'url(#arrowhead-red)');
        
      svg.append('text')
        .attr('x', treeX - treeGap/2)
        .attr('y', treeY - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'red')
        .text('Errors');
    }
  }
  
  //final model box
  svg.append('rect')
    .attr('x', width/2 - 150)
    .attr('y', 320)
    .attr('width', 300)
    .attr('height', 50)
    .attr('fill', '#9b59b6')
    .attr('rx', 5);
    
  svg.append('text')
    .attr('x', width/2)
    .attr('y', 350)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text('Model: 0.3*Tree1 + 0.5*Tree2 + 0.2*Tree3');
    
  //lines to final model
  for (let i = 0; i < 3; i++) {
    const treeX = treeStartX + i * treeGap;
    
    svg.append('line')
      .attr('x1', treeX)
      .attr('y1', treeY + treeHeight)
      .attr('x2', width/2)
      .attr('y2', 320)
      .attr('stroke', treeColors[i])
      .attr('stroke-width', 1.5)
      .attr('marker-end', `url(#arrowhead-${i})`);
  }
  
  //concept labels with tooltips
const concepts = [
    {
      x: 120,
      y: 250,
      text: 'Sequential Training',
      tooltip: 'Trees are built one after another, with each new tree focusing on correcting the errors made by the combination of previous trees.'
    },
    {
      x: width - 120,
      y: 275,
      text: 'Weighted Combination',
      tooltip: 'Trees contribute unequally to the final prediction, with weights determined during training to optimize performance.'
    },
    {
      x: width - 100,
      y: 350,
      text: 'Gradient Descent Optimization',
      tooltip: 'Trees are added to minimize a loss function using gradient descent, gradually improving the model in the direction that reduces errors most.'
    }
  ];
  
  concepts.forEach(c => {
    const tooltipGroup = svg.append('g')
      .attr('class', 'tooltip-group');
        tooltipGroup.append('text')
      .attr('x', c.x)
      .attr('y', c.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-style', 'italic')
      .attr('fill', '#555')
      .attr('cursor', 'help')
      .text(c.text);
    
    //add invisible rectangle for better hover area
    tooltipGroup.append('rect')
      .attr('x', c.x - 70)
      .attr('y', c.y - 12)
      .attr('width', 140)
      .attr('height', 16)
      .attr('fill', 'transparent')
      .attr('cursor', 'help');
    
    //add tooltip box (initially hidden)
    const tooltip = tooltipGroup.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .attr('pointer-events', 'none');
    
    //tooltip background
    tooltip.append('rect')
      .attr('x', c.x - 110)
      .attr('y', c.y - 5)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 220)
      .attr('height', 70)
      .attr('fill', '#333')
      .attr('opacity', 0.9);
    
    //tooltip text
    tooltip.append('text')
      .attr('x', c.x - 100)
      .attr('y', c.y + 15)
      .attr('width', 200)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .text(function() {
        return c.tooltip;
      })
      .call(wrap, 200);
    
    //add mouse events
    tooltipGroup.on('mouseover', function() {
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
    }).on('mouseout', function() {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });
  });
  //add arrowhead markers
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#333');
    
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead-red')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'red');
    
  //colored arrowheads for tree contributions
  for (let i = 0; i < 3; i++) {
    svg.append('defs').append('marker')
      .attr('id', `arrowhead-${i}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', treeColors[i]);
  }
  
  //setting delay on time out
  setTimeout(() => animateXGBoost(svg), 500);
}

// function for decision tree
function drawTree(svg, centerX, topY, width, height, color = '#3498db') {
  // root nodes
  svg.append('circle')
    .attr('cx', centerX)
    .attr('cy', topY)
    .attr('r', 15)
    .attr('fill', color);
    
  // level 1 nodes
  svg.append('circle')
    .attr('cx', centerX - width/3)
    .attr('cy', topY + height/3)
    .attr('r', 10)
    .attr('fill', color);
    
  svg.append('circle')
    .attr('cx', centerX + width/3)
    .attr('cy', topY + height/3)
    .attr('r', 10)
    .attr('fill', color);
    
  // level 2 nodes
  svg.append('circle')
    .attr('cx', centerX - width/2)
    .attr('cy', topY + height*2/3)
    .attr('r', 8)
    .attr('fill', color);
    
  svg.append('circle')
    .attr('cx', centerX - width/6)
    .attr('cy', topY + height*2/3)
    .attr('r', 8)
    .attr('fill', color);
    
  svg.append('circle')
    .attr('cx', centerX + width/6)
    .attr('cy', topY + height*2/3)
    .attr('r', 8)
    .attr('fill', color);
    
  svg.append('circle')
    .attr('cx', centerX + width/2)
    .attr('cy', topY + height*2/3)
    .attr('r', 8)
    .attr('fill', color);
    
  // conecting lines
  svg.append('line')
    .attr('x1', centerX)
    .attr('y1', topY)
    .attr('x2', centerX - width/3)
    .attr('y2', topY + height/3)
    .attr('stroke', color)
    .attr('stroke-width', 2);
    
  svg.append('line')
    .attr('x1', centerX)
    .attr('y1', topY)
    .attr('x2', centerX + width/3)
    .attr('y2', topY + height/3)
    .attr('stroke', color)
    .attr('stroke-width', 2);
    
  svg.append('line')
    .attr('x1', centerX - width/3)
    .attr('y1', topY + height/3)
    .attr('x2', centerX - width/2)
    .attr('y2', topY + height*2/3)
    .attr('stroke', color)
    .attr('stroke-width', 1.5);
    
  svg.append('line')
    .attr('x1', centerX - width/3)
    .attr('y1', topY + height/3)
    .attr('x2', centerX - width/6)
    .attr('y2', topY + height*2/3)
    .attr('stroke', color)
    .attr('stroke-width', 1.5);
    
  svg.append('line')
    .attr('x1', centerX + width/3)
    .attr('y1', topY + height/3)
    .attr('x2', centerX + width/6)
    .attr('y2', topY + height*2/3)
    .attr('stroke', color)
    .attr('stroke-width', 1.5);
    
  svg.append('line')
    .attr('x1', centerX + width/3)
    .attr('y1', topY + height/3)
    .attr('x2', centerX + width/2)
    .attr('y2', topY + height*2/3)
    .attr('stroke', color)
    .attr('stroke-width', 1.5);
}
function animateXGBoost(svg) {
  isAnimating = true;
  
  // constants
  const treeStartX = 250;
  const treeGap = 160;
  const treeY = 140;
  
  // tree 1: animate the first tree's decision path
  setTimeout(() => {
    // root node of first tree
    svg.selectAll('circle')
      .filter(function() {
        const cx = parseFloat(d3.select(this).attr('cx'));
        const cy = parseFloat(d3.select(this).attr('cy'));
        return Math.abs(cx - treeStartX) < 5 && Math.abs(cy - treeY) < 5;
      })
      .transition()
      .duration(400)
      .attr('r', function() {
        return parseFloat(d3.select(this).attr('r')) * 1.3;
      })
      .transition()
      .duration(400)
      .attr('r', function() {
        return parseFloat(d3.select(this).attr('r')) / 1.3;
      });
      
    // branch node left
    setTimeout(() => {
      svg.selectAll('circle')
        .filter(function() {
          const cx = parseFloat(d3.select(this).attr('cx'));
          const cy = parseFloat(d3.select(this).attr('cy'));
          return Math.abs(cx - (treeStartX - treeWidth/3)) < 5 && Math.abs(cy - (treeY + treeHeight/3)) < 5;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) * 1.3;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) / 1.3;
        });
    }, 500);
    
    // leaf node
    setTimeout(() => {
      svg.selectAll('circle')
        .filter(function() {
          const cx = parseFloat(d3.select(this).attr('cx'));
          const cy = parseFloat(d3.select(this).attr('cy'));
          return Math.abs(cx - (treeStartX - treeWidth/2)) < 5 && Math.abs(cy - (treeY + treeHeight*2/3)) < 5;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) * 1.3;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) / 1.3;
        });
    }, 1000);
  }, 300);
  
  // error flow to second tree
  setTimeout(() => {
    svg.selectAll('line')
      .filter(function() {
        return d3.select(this).attr('stroke') === 'red' && 
               Math.abs(parseFloat(d3.select(this).attr('x2')) - (treeStartX + treeGap - treeWidth/2)) < 10;
      })
      .attr('stroke-dasharray', '5,30')
      .transition()
      .duration(800)
      .attr('stroke-dasharray', '5,3');
  }, 1800);
  
  // tree 2: animating the second trees path
  setTimeout(() => {
    // root node of second tree
    svg.selectAll('circle')
      .filter(function() {
        const cx = parseFloat(d3.select(this).attr('cx'));
        const cy = parseFloat(d3.select(this).attr('cy'));
        return Math.abs(cx - (treeStartX + treeGap)) < 5 && Math.abs(cy - treeY) < 5;
      })
      .transition()
      .duration(400)
      .attr('r', function() {
        return parseFloat(d3.select(this).attr('r')) * 1.3;
      })
      .transition()
      .duration(400)
      .attr('r', function() {
        return parseFloat(d3.select(this).attr('r')) / 1.3;
      });
    
    // branch node right
    setTimeout(() => {
      svg.selectAll('circle')
        .filter(function() {
          const cx = parseFloat(d3.select(this).attr('cx'));
          const cy = parseFloat(d3.select(this).attr('cy'));
          return Math.abs(cx - (treeStartX + treeGap + treeWidth/3)) < 5 && 
                 Math.abs(cy - (treeY + treeHeight/3)) < 5;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) * 1.3;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) / 1.3;
        });
    }, 500);
    
    // leaf node
    setTimeout(() => {
      svg.selectAll('circle')
        .filter(function() {
          const cx = parseFloat(d3.select(this).attr('cx'));
          const cy = parseFloat(d3.select(this).attr('cy'));
          return Math.abs(cx - (treeStartX + treeGap + treeWidth/6)) < 5 && 
                 Math.abs(cy - (treeY + treeHeight*2/3)) < 5;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) * 1.3;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) / 1.3;
        });
    }, 1000);
  }, 2600);
  
  // errow flow to third tree
  setTimeout(() => {
    svg.selectAll('line')
      .filter(function() {
        return d3.select(this).attr('stroke') === 'red' && 
               Math.abs(parseFloat(d3.select(this).attr('x2')) - (treeStartX + 2*treeGap - treeWidth/2)) < 10;
      })
      .attr('stroke-dasharray', '5,30')
      .transition()
      .duration(800)
      .attr('stroke-dasharray', '5,3');
  }, 4100);
  
  // animating the third tree's path
  setTimeout(() => {
    // root node of third tree
    svg.selectAll('circle')
      .filter(function() {
        const cx = parseFloat(d3.select(this).attr('cx'));
        const cy = parseFloat(d3.select(this).attr('cy'));
        return Math.abs(cx - (treeStartX + 2*treeGap)) < 5 && Math.abs(cy - treeY) < 5;
      })
      .transition()
      .duration(400)
      .attr('r', function() {
        return parseFloat(d3.select(this).attr('r')) * 1.3;
      })
      .transition()
      .duration(400)
      .attr('r', function() {
        return parseFloat(d3.select(this).attr('r')) / 1.3;
      });
    
    // branch node right
    setTimeout(() => {
      svg.selectAll('circle')
        .filter(function() {
          const cx = parseFloat(d3.select(this).attr('cx'));
          const cy = parseFloat(d3.select(this).attr('cy'));
          return Math.abs(cx - (treeStartX + 2*treeGap + treeWidth/3)) < 5 && 
                 Math.abs(cy - (treeY + treeHeight/3)) < 5;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) * 1.3;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) / 1.3;
        });
    }, 500);
    
    // leaf node
    setTimeout(() => {
      svg.selectAll('circle')
        .filter(function() {
          const cx = parseFloat(d3.select(this).attr('cx'));
          const cy = parseFloat(d3.select(this).attr('cy'));
          return Math.abs(cx - (treeStartX + 2*treeGap + treeWidth/2)) < 5 && 
                 Math.abs(cy - (treeY + treeHeight*2/3)) < 5;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) * 1.3;
        })
        .transition()
        .duration(400)
        .attr('r', function() {
          return parseFloat(d3.select(this).attr('r')) / 1.3;
        });
    }, 1000);
  }, 4900);
  
  // animating lines to our final model ouput
  setTimeout(() => {
    const treeColors = ['#3498db', '#2ecc71', '#e74c3c'];
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        svg.selectAll('line')
          .filter(function() {
            return d3.select(this).attr('stroke') === treeColors[i] && 
                   d3.select(this).attr('marker-end') === `url(#arrowhead-${i})`;
          })
          .attr('stroke-dasharray', '5,20')
          .transition()
          .duration(600)
          .attr('stroke-dasharray', '0,0')
          .attr('stroke-width', 2.5)
          .transition()
          .duration(400)
          .attr('stroke-width', 1.5);
      }, i * 300);
    }
  }, 6000);
  
  // final model output box
  setTimeout(() => {
    svg.select('rect')
      .filter(function() {
        return parseFloat(d3.select(this).attr('y')) === 320;
      })
      .transition()
      .duration(600)
      .attr('transform', 'translate(-10, -5) scale(1.1)')
      .attr('fill', '#e74c3c')
      .transition()
      .duration(600)
      .attr('transform', 'translate(0, 0) scale(1.0)')
      .attr('fill', '#9b59b6');
      
    isAnimating = false;
  }, 7200);
}

// helper function for our tool tips
function wrap(text, width) {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy") || 0);
      let tspan = text.text(null).append("tspan")
        .attr("x", text.attr("x"))
        .attr("y", y)
        .attr("dy", dy + "em");
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }