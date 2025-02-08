import React, { useState } from 'react';
import { Direction, INode } from './lib/view/types';
import { Mindmap, MindmapConfig } from './components/Mindmap';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  getSimpleSampleData,
  getComplexSampleData,
  initializePayload,
} from './utils/sampleData';
import { Transformer } from './lib/core/transform';
import { IPureNode } from './common';
import { initializeNode, MindMapUtils } from './lib/view/lib/utils';

interface PlaygroundOptions {
  controls?: boolean;
}

const transformer = new Transformer([
  {
    name: 'custom',
    transform: () => {
      return {
        styles: [
          {
            type: 'style',
            data: `
          .markmap-foreign { display: inline-flex; padding: 4px 8px; border-radius: 6px; transition: all 0.2s ease; }
       
        `,
          },
        ],
        scripts: [],
      };
    },
  },
]);

// 1. Design Systems Mindmap
const designSystemsMarkdown = `
# Design Systems

## Foundations
### Color Palette
- Primary/secondary colors
  - Primary colors establish brand identity and guide user attention. The selection of primary colors is crucial as they form the foundation of your visual language. These colors should reflect your brand personality while ensuring they work harmoniously across different mediums and contexts. Consider how these colors will appear in both digital and print formats, and how they might need to be adjusted for different background colors or lighting conditions.
  - Secondary colors support primary colors and provide visual hierarchy. They offer flexibility and depth to your design system, allowing for more nuanced visual communication. Secondary colors should complement your primary palette while providing enough contrast to create distinct visual elements. They're particularly useful for creating subtle variations in UI components, backgrounds, and decorative elements.
  - Consider cultural color meanings and emotional impact. Colors carry different meanings across cultures and can evoke specific emotional responses. For example, while red might signify luck and prosperity in Chinese culture, it could represent danger or warning in Western contexts. Understanding these cultural nuances is crucial for creating globally accessible design systems that resonate positively with diverse user bases.
- Semantic colors (success, warning, error)
  - Green for success: Indicates completed actions and positive states. The use of green should be consistent across the interface to build user trust and recognition. Consider using different shades of green for various success states, ensuring each variation maintains sufficient contrast while clearly communicating positive feedback. The success state should be immediately recognizable but not overwhelming, striking a balance between visibility and subtlety.
  - Yellow/Orange for warning: Alerts users to potential issues. Warning colors should be distinct from both success and error states, creating a clear hierarchy of importance. These colors need to be noticeable enough to draw attention but not so alarming that they cause unnecessary anxiety. Consider using softer shades for less critical warnings and more vibrant ones for time-sensitive alerts.
  - Red for error: Highlights critical problems requiring attention. Error states should be immediately noticeable but not panic-inducing. The red used should be bold enough to command attention while maintaining readability when combined with error messages. Consider implementing different intensities of red for various error severities, ensuring each level is distinguishable while maintaining a cohesive error feedback system.

### Typography
- Type scale hierarchy
  - Follow modular scale for consistent visual rhythm. A modular scale creates mathematical harmony in your typography, making it easier to maintain consistency across different screen sizes and contexts. The scale should be carefully chosen to provide enough distinction between different text levels while maintaining a cohesive visual language. Consider how the scale will work across different languages and character sets.
  - Common ratios: 1.2 (minor third) or 1.5 (perfect fifth). These ratios have been proven effective in creating harmonious typography hierarchies. The minor third (1.2) provides subtle but noticeable size differences, making it suitable for dense information displays, while the perfect fifth (1.5) creates more dramatic contrast, useful for marketing and editorial content.
  - Define clear heading levels (H1-H6) with distinct sizes. Each heading level should have a clear purpose and visual distinction. Consider not just size, but also weight, line height, and spacing to create clear hierarchical relationships. The differences between levels should be noticeable enough to convey structure while maintaining visual harmony.

## Components
### Base Components
- Buttons (primary, secondary, ghost)
  - Clear visual hierarchy between button types. The hierarchy should be immediately apparent through size, color, and prominence. Primary buttons should stand out as the main call-to-action, while secondary and ghost buttons provide alternative levels of emphasis. Consider how these buttons will appear in different contexts and ensure their hierarchy remains clear when multiple buttons are used together.
  - Consistent padding and height across variants. Maintaining consistent dimensions helps create a polished, professional appearance and improves usability. The padding should be generous enough to create comfortable touch targets while maintaining visual balance. Consider how the padding might need to adjust for different button labels and icon combinations.
  - Special considerations for button states. Loading states should provide clear feedback while maintaining button dimensions to prevent layout shifts. Disabled states should clearly indicate unavailability while preserving the button's role in the interface. Touch targets should be optimized for various devices and input methods.
- Form elements (accessible labels, error states)
  - Label positioning and alignment
  - Clear error message placement
  - Special considerations:
    - Field validation timing
    - Required field indicators
    - Help text placement

### Composite Patterns
- Data tables with sorting/filtering
  - Column header interactions
  - Filter UI patterns
  - Special considerations:
    - Empty states and loading indicators
    - Responsive behavior on mobile
    - Bulk action patterns
- Complex form workflows
  - Multi-step navigation
  - Progress indicators
  - Special considerations:
    - Form state persistence
    - Validation timing
    - Error recovery patterns

## Documentation
### Usage Guidelines
- Do's and Don'ts with visual examples
  - Clear examples of correct implementation
  - Common anti-patterns to avoid
  - Special considerations:
    - Accessibility requirements
    - Performance implications
    - Browser compatibility
- Content writing standards
  - Voice and tone guidelines
  - UI text patterns
  - Special considerations:
    - Localization requirements
    - Character length limits
    - Reading level guidelines

### Design Tokens
- JSON structure for cross-platform use
  - Nested categorization
  - Semantic naming conventions
  - Special considerations:
    - Platform-specific values
    - Dark mode variants
    - Legacy system support
- Versioning strategy
  - Semantic versioning rules
  - Breaking change policies
  - Special considerations:
    - Deprecation process
    - Migration guides
    - Backward compatibility

## Maintenance
### Contribution Model
- Component proposal process
  - Needs assessment criteria
  - Design review stages
  - Special considerations:
    - Impact analysis
    - Implementation complexity
    - Maintenance overhead
- Governance board structure
  - Role definitions
  - Decision-making process
  - Special considerations:
    - Stakeholder representation
    - Meeting cadence
    - Documentation requirements

### Quality Assurance
- Visual regression testing
  - Screenshot comparison tools
  - Cross-browser testing
  - Special considerations:
    - Test environment setup
    - Baseline management
    - False positive handling
- Accessibility audits
  - Automated testing tools
  - Manual testing procedures
  - Special considerations:
    - WCAG compliance levels
    - Screen reader testing
    - Keyboard navigation
`;

// 2. UI Component Architecture
const componentArchMarkdown = `
# UI Component Architecture

## Design Principles
### Atomic Design
- Atoms: Basic HTML elements
  - Pure, stateless components form the foundation of your component library. These fundamental building blocks should be highly reusable and maintain consistent behavior across different contexts. Consider how these components will be styled, ensuring they can adapt to different themes while maintaining their core functionality. Documentation should clearly explain the component's purpose, props, and usage patterns.
  - Maximum reusability requires careful consideration of component APIs. Props should be flexible enough to accommodate various use cases while maintaining clear defaults and validation. Consider how the component will behave in different contexts and ensure it remains accessible and performant across all implementations. The API design should follow consistent patterns across all atomic components.
  - Special considerations include managing browser inconsistencies and maintaining accessibility standards. Each component should be thoroughly tested across different browsers and devices, with particular attention to focus management and keyboard navigation. Consider implementing ARIA attributes and roles appropriately, and ensure proper semantic HTML usage.

## State Management
### Component States
- Loading, error, empty states
  - Consistent loading indicators provide visual feedback during asynchronous operations. The loading state should maintain the component's layout to prevent jarring shifts when content loads. Consider implementing skeleton screens for complex components and progress indicators for long-running operations. The loading state should be visually distinct but not distracting.
  - Error message patterns should be clear and actionable. Error states should provide clear feedback about what went wrong and how to resolve the issue. Consider implementing retry mechanisms for failed operations and fallback content for critical components. The error state should be visually distinct but not overwhelming.
  - Empty states should guide users and maintain context. Rather than showing blank spaces, empty states should provide helpful information about why content is missing and what actions users can take. Consider implementing contextual calls-to-action and explanatory illustrations. The empty state should maintain the component's visual hierarchy.

### Data Flow
- Props drilling vs context
  - Component composition patterns affect maintainability and reusability. Carefully consider the trade-offs between prop drilling and context usage. While prop drilling can make data flow explicit, it can lead to verbose and brittle code in deeply nested components. Context provides a way to share values without explicitly passing props through every level.
  - State lifting strategies should balance component independence with data sharing needs. Consider implementing container components to manage shared state and passing only necessary data to presentational components. The strategy should maintain clear boundaries between stateful and stateless components while minimizing unnecessary re-renders.
  - Special considerations include performance implications and testing complexity. Context updates can trigger re-renders in all consuming components, so consider implementing memoization and selective updates. Testing becomes more complex with shared state, so consider implementing proper test isolation and mocking strategies.

## Performance
### Rendering Optimization
- Memoization techniques
  - useMemo usage patterns
  - React.memo implementation
  - Special considerations:
    - Dependency arrays
    - Memory trade-offs
    - Over-optimization risks
- Virtualized lists
  - Window calculation
  - Scroll performance
  - Special considerations:
    - Variable height items
    - Smooth scrolling
    - Initial load performance

### Bundle Size
- Tree-shaking strategies
  - Import optimization
  - Dead code elimination
  - Special considerations:
    - Build configuration
    - Package selection
    - Code splitting points
- Dynamic imports
  - Route-based splitting
  - Component lazy loading
  - Special considerations:
    - Loading indicators
    - Error boundaries
    - Caching strategies

## Testing
### Unit Testing
- Component interaction tests
  - User event simulation
  - State verification
  - Special considerations:
    - Mock data management
    - Async operations
    - Test isolation
- Snapshot testing
  - Component rendering
  - Visual regression
  - Special considerations:
    - Snapshot maintenance
    - Dynamic content
    - Test reliability

### E2E Testing
- User flow validation
  - Critical path testing
  - Error scenarios
  - Special considerations:
    - Test data setup
    - Environment management
    - Flaky test handling
- Cross-browser testing
  - Browser matrix
  - Feature detection
  - Special considerations:
    - Mobile testing
    - Responsive design
    - Performance metrics
`;

// 3. Algorithm Design Patterns
const algorithmPatternsMarkdown = `
# Algorithm Design Patterns

## Efficiency Patterns
### Divide and Conquer
- Merge sort implementation
  - Time complexity analysis reveals the efficiency of divide and conquer in sorting. The O(n log n) complexity comes from dividing the array into smaller subarrays and merging them back together. Each level of division reduces the problem size by half, while the merge operation processes each element exactly once. This logarithmic division combined with linear merging creates an efficient sorting algorithm that outperforms simpler O(n²) sorts for large datasets.
  - Memory usage patterns require careful consideration of space complexity. The standard implementation uses O(n) additional space for merging, which can be significant for large arrays. In-place variations exist but often sacrifice some readability or stability for reduced memory usage. Consider the trade-offs between memory efficiency and algorithm clarity when implementing merge sort, especially for systems with memory constraints.
  - Special considerations include stability requirements and parallel processing opportunities. Merge sort naturally maintains the relative order of equal elements, making it stable by default. The algorithm's divide-and-conquer nature also makes it well-suited for parallel implementation, though the overhead of thread management must be balanced against potential performance gains.

### Greedy Algorithms
- Dijkstra's shortest path
  - Priority queue implementation is crucial for optimal performance. The choice of priority queue data structure significantly impacts the algorithm's efficiency. Binary heaps offer O(log n) operations with simple implementation, while Fibonacci heaps provide theoretical O(1) decrease-key operations but are more complex to implement. Consider the trade-offs between implementation complexity and performance requirements.
  - Path reconstruction requires careful tracking of predecessor nodes. Maintaining the shortest path tree during algorithm execution allows efficient path reconstruction without additional computation. Consider implementing path caching strategies for frequently requested routes, while being mindful of memory usage and cache invalidation requirements.
  - Special considerations include handling negative weights and sparse graphs. While Dijkstra's algorithm doesn't work with negative weights, modifications like Bellman-Ford can handle such cases at the cost of increased complexity. For sparse graphs, consider using adjacency lists instead of matrices to reduce memory usage and improve cache efficiency.

## Structural Patterns
### Dynamic Programming
- Fibonacci memoization
  - Top-down vs bottom-up approaches offer different trade-offs. The top-down approach with memoization provides intuitive recursive implementation but has stack overhead. Bottom-up approaches eliminate recursion overhead but may calculate unnecessary values. Consider the problem constraints and access patterns when choosing between approaches.
  - Space optimization techniques can significantly reduce memory usage. Using only the last two values instead of storing the entire sequence reduces space complexity from O(n) to O(1). Consider implementing circular buffers or variable swapping techniques when only recent values are needed. The choice of optimization should balance memory savings with code clarity.
  - Special considerations include handling large numbers and overflow conditions. Numbers in the Fibonacci sequence grow exponentially, requiring careful consideration of numeric type limits. Consider implementing arbitrary-precision arithmetic for large values, and document the valid input ranges clearly. Cache management becomes crucial when dealing with large input ranges.

## Optimization
### Space-Time Tradeoffs
- Lookup tables vs computed values
  - Memory requirements
  - Access patterns
  - Special considerations:
    - Cache invalidation
    - Update frequency
    - Storage constraints
- Caching strategies
  - Cache levels
  - Eviction policies
  - Special considerations:
    - Hit ratio
    - Consistency
    - Memory pressure

### Parallelism
- MapReduce patterns
  - Data partitioning
  - Aggregation strategies
  - Special considerations:
    - Load balancing
    - Fault tolerance
    - Network overhead
- Multithreading considerations
  - Thread safety
  - Synchronization
  - Special considerations:
    - Race conditions
    - Deadlock prevention
    - Resource sharing
`;

// 4. System Design Strategies
const systemDesignMarkdown = `
# System Design Strategies

## Scalability Patterns
### Load Balancing
- Algorithm Selection
  - Round-robin load balancing distributes requests sequentially across servers, providing a simple but effective distribution mechanism. While straightforward to implement, it doesn't account for server capacity or current load, which can lead to uneven distribution in real-world scenarios. Consider implementing weighted round-robin for heterogeneous server environments where different servers have varying capacities or processing capabilities.
  - Least connections balancing actively tracks connection counts to each server, directing new requests to the least busy server. This dynamic approach better handles varying request complexities and server capacities, but requires more overhead for connection tracking. Consider implementing connection count thresholds and health checks to prevent overloading individual servers.
  - Special considerations include session persistence requirements and SSL termination strategies. Sticky sessions may be necessary for stateful applications, while SSL termination at the load balancer can offload cryptographic processing from application servers but requires careful security configuration.

### Caching Strategies
- Multi-level Caching
  - Client-side caching reduces server load and improves response times by storing frequently accessed data in the browser. Consider implementing appropriate cache headers and versioning strategies to ensure clients receive updated data when necessary. Browser storage limits and cache invalidation patterns must be carefully managed to prevent stale data issues.
  - CDN caching distributes content closer to users, reducing latency and backend load. Configure cache rules based on content type and update frequency, with special attention to cache invalidation mechanisms for dynamic content. Consider implementing cache warming strategies for predictable traffic patterns and content updates.
  - Application-level caching requires careful balance between memory usage and hit rates. Implement appropriate eviction policies based on access patterns and data importance. Consider using distributed caching solutions for horizontal scalability and resilience to individual node failures.

### Database Design
- Sharding Strategies
  - Horizontal sharding distributes data across multiple database instances based on partition keys. The selection of partition keys significantly impacts query performance and data distribution. Consider future growth patterns and query requirements when designing sharding schemes to minimize the need for cross-shard operations.
  - Vertical sharding separates different types of data into specialized databases. This approach can improve performance by optimizing each database for specific data types and access patterns. Consider the trade-offs between data consistency and query complexity when designing vertical sharding schemes.
  - Special considerations include managing cross-shard transactions and maintaining consistent backup strategies. Implement appropriate monitoring and alerting for shard health and rebalancing operations. Consider using shard management tools to automate routine maintenance tasks.

## Reliability Patterns
### Fault Tolerance
- Circuit Breaker Pattern
  - Failure detection mechanisms should quickly identify and isolate failing components. The circuit breaker should monitor failure rates and response times, automatically opening when thresholds are exceeded. Consider implementing half-open states to test recovery without overwhelming the system.
  - Recovery strategies should gracefully handle service degradation. Implement fallback mechanisms and cached responses for critical functionality. Consider implementing bulkhead patterns to isolate failures and prevent cascading issues across the system.
  - Special considerations include timeout configurations and monitoring requirements. Proper instrumentation is crucial for detecting and responding to failures. Consider implementing adaptive timeouts based on system load and network conditions.
`;

const MINDMAPS = [
  { id: 'design-systems', label: 'Design Systems', content: designSystemsMarkdown },
  { id: 'component-arch', label: 'UI Component Architecture', content: componentArchMarkdown },
  { id: 'algo-patterns', label: 'Algorithm Patterns', content: algorithmPatternsMarkdown },
  { id: 'system-design', label: 'System Design', content: systemDesignMarkdown }
];

function getMarkdownData(markdown: string): INode {
  const result = transformer.transform(markdown);
  let nextId = 1;
  const initNode = (node: IPureNode, depth = 0, path = ''): INode => {
    const id = nextId++;
    const nodeWithState = {
      ...node,
      state: {
        key: id.toString(),
        id,
        depth,
        path: path ? `${path}.${id}` : id.toString(),
        size: [280, 0] as [number, number],
        rect: { x: 0, y: 0, width: 0, height: 0 },
        shouldAnimate: true
      }
    } as INode;
    
    if (node.children) {
      nodeWithState.children = node.children.map((child, index) => 
        initNode(child, depth + 1, nodeWithState.state.path)
      );
    }
    return nodeWithState;
  };
  return initNode(result.root);
}

interface NodeContextMenuProps {
  node: INode | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAction: (action: string) => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({ node, position, onClose, onAction }) => {
  if (!node || !position) return null;

  return (
    <DropdownMenu.Root open={true} onOpenChange={onClose}>
      <DropdownMenu.Trigger asChild>
        <div style={{ position: 'fixed', top: position.y, left: position.x }} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-md p-1 shadow-lg"
          sideOffset={2}
        >
          <DropdownMenu.Item
            className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-100 rounded"
            onSelect={() => onAction('add-subtopic')}
          >
            Add Subtopic
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-100 rounded"
            onSelect={() => onAction('add-sibling')}
          >
            Add Sibling Topic
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-100 rounded"
            onSelect={() => onAction('expand-more')}
          >
            Expand More
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item
            className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-100 rounded"
            onSelect={() => onAction('copy')}
          >
            Copy Content
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-100 text-red-600 rounded"
            onSelect={() => onAction('delete')}
          >
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const MindmapPlayground: React.FC<PlaygroundOptions> = ({ controls }) => {
  const [currentData, setCurrentData] = useState<INode>(() => {
    const data = getMarkdownData(systemDesignMarkdown);
    initializePayload(data);
    return data;
  });
  const [contextMenu, setContextMenu] = useState<{
    node: INode | null;
    position: { x: number; y: number } | null;
  }>({
    node: null,
    position: null,
  });

  const handleNodeClick = (node: INode, event: React.MouseEvent) => {
    // Only show context menu on right click
    console.log("Clicked")
    event.preventDefault();
      event.stopPropagation();
      
      setContextMenu({
        node,
        position: { x: event.clientX, y: event.clientY },
      });
  };

  const handleBackgroundClick = (event: React.MouseEvent) => {
    // Only close if clicking directly on the background
    if (event.target === event.currentTarget) {
      handleContextMenuClose();
    }
  };

  const handleContextMenuClose = () => {
    setContextMenu({ node: null, position: null });
  };

  const handleContextMenuAction = (action: string) => {
    const node = contextMenu.node;
    if (!node) return;

    switch (action) {
      case 'add-subtopic':
        // Add implementation
        break;
      case 'add-sibling':
        // Add implementation
        break;
      case 'expand-more':
        if (node.children?.length) {
          node.children.forEach((child) => {
            if (!child.payload) child.payload = { fold: 0 };
            child.payload.fold = 0;
          });
          setCurrentData({ ...currentData });
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(node.content);
        break;
      case 'delete':
        // Add implementation
        break;
    }
    handleContextMenuClose();
  };

  const handleMindmapChange = (selectedId: string) => {
    const selected = MINDMAPS.find(m => m.id === selectedId);
    if (selected) {
      const data = getMarkdownData(selected.content);
      initializePayload(data);
      setCurrentData(data);
    }
  };

  const config: MindmapConfig = {
    initialDirection: Direction.LR,
    controls: {
      show: controls,
      showDataControl: false,
    },
  };

  return (
    <div 
      style={{ width: '100%', height: '100%' }}
      onClick={handleBackgroundClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Mindmap 
        data={currentData} 
        config={config} 
        onNodeClick={handleNodeClick}
      />
      <NodeContextMenu
        node={contextMenu.node}
        position={contextMenu.position}
        onClose={handleContextMenuClose}
        onAction={handleContextMenuAction}
      />
      
      {controls && (
        <div style={{ 
          position: 'fixed',
          top: '100px',
          right: '20px',
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Select Mindmap:
            <select 
              onChange={(e) => handleMindmapChange(e.target.value)}
              style={{ 
                marginLeft: '10px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              {MINDMAPS.map(mindmap => (
                <option key={mindmap.id} value={mindmap.id}>
                  {mindmap.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export default MindmapPlayground;
