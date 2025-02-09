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
#### Color Theory
- Basic Principles
  - Color Wheel Relationships
    - Complementary Pairs
    - Analogous Groups
    - Triadic Combinations
  - Color Properties
    - Hue Variations
    - Saturation Levels
    - Brightness Control
  - Psychological Impact
    - Cultural Associations
    - Emotional Responses
    - Brand Perception
- Advanced Concepts
  - Color Spaces
    - RGB Color Model
      - Digital Applications
      - Screen Rendering
    - CMYK Color Model
      - Print Production
      - Material Considerations
    - HSL/HSV Models
      - User Interface Design
      - Color Picking Tools
  - Color Harmony
    - Balance Principles
    - Visual Weight
    - Spatial Distribution

#### Color Systems
- Brand Colors
  - Primary Palette
    - Main Brand Color
      - Usage Guidelines
      - Variation Rules
    - Supporting Colors
      - Combination Rules
      - Context Guidelines
    - Accent Colors
      - Highlight Usage
      - Interactive States
  - Extended Palette
    - Neutral Colors
      - Background Uses
      - Text Applications
    - Gradients
      - Direction Rules
      - Opacity Guidelines
- Functional Colors
  - Status Colors
    - Success States
      - Positive Feedback
      - Completion Indicators
    - Warning States
      - Alert Levels
      - Caution Indicators
    - Error States
      - Critical Alerts
      - Failure Indicators
  - Interactive Colors
    - Link States
      - Default State
      - Hover Effects
      - Active State
    - Button States
      - Primary Actions
      - Secondary Actions
      - Disabled State

#### Color Management
- Technical Implementation
  - Color Variables
    - Token Structure
    - Naming Conventions
  - Color Functions
    - Manipulation Methods
    - Calculation Tools
  - Platform Support
    - Browser Compatibility
    - Device Considerations
- Accessibility Standards
  - Contrast Requirements
    - WCAG Guidelines
      - AA Compliance
      - AAA Compliance
    - Testing Methods
      - Automated Checks
      - Manual Verification
  - Color Blindness
    - Deuteranopia Support
    - Protanopia Support
    - Tritanopia Support
- Documentation
  - Usage Guidelines
    - Implementation Rules
    - Best Practices
  - Maintenance
    - Version Control
    - Update Procedures

### Typography
#### Typeface Management
- Font Selection
  - Primary Fonts
    - Display Typography
      - Header Styles
      - Hero Text
    - Body Typography
      - Paragraph Text
      - List Styles
    - Monospace Fonts
      - Code Blocks
      - Technical Data
  - Fallback Strategy
    - System Fonts
      - Platform Specifics
      - Degradation Rules
    - Web Fonts
      - Loading Strategy
      - Performance Impact
- Font Loading
  - Performance Optimization
    - Preloading
      - Critical Fonts
      - Secondary Fonts
    - Lazy Loading
      - Threshold Rules
      - Priority Settings
  - Browser Support
    - Rendering Issues
      - Anti-aliasing
      - Font Smoothing
    - Compatibility
      - Legacy Browsers
      - Modern Features

#### Typography Scale
- Scale System
  - Mathematical Ratios
    - Golden Ratio (1.618)
      - Visual Harmony
      - Size Progression
    - Perfect Fourth (1.333)
      - Balanced Hierarchy
      - Compact Layouts
    - Custom Ratios
      - Specific Needs
      - Brand Requirements
  - Implementation
    - CSS Variables
      - Scale Generation
      - Responsive Adaptation
    - Component Integration
      - Consistent Usage
      - Override Rules
- Responsive Typography
  - Breakpoint System
    - Mobile Sizes
      - Minimum Readability
      - Touch Targets
    - Desktop Sizes
      - Reading Distance
      - Screen Resolution
  - Fluid Typography
    - Calculation Methods
      - Viewport Units
      - Clamp Function
    - Performance Impact
      - Rendering Speed
      - Layout Stability

#### Text Styles
- Hierarchy System
  - Headings
    - Size Progression
      - Visual Weight
      - Spacing Rules
    - Semantic Structure
      - HTML Mapping
      - Accessibility
  - Body Text
    - Paragraph Styles
      - Line Height
      - Margin Rules
    - List Formatting
      - Bullet Styles
      - Spacing Rules
- Special Formats
  - Emphasis
    - Bold Text
      - Weight Selection
      - Usage Rules
    - Italic Text
      - Style Guidelines
      - Cultural Considerations
  - Links
    - State Styles
      - Default Look
      - Hover Effects
    - Accessibility
      - Focus States
      - Color Contrast

#### Typography Tools
- Development Tools
  - CSS Utilities
    - Mixins
      - Common Patterns
      - Customization
    - Functions
      - Calculations
      - Conversions
  - Testing Tools
    - Visual Regression
      - Snapshot Testing
      - Comparison Tools
    - Performance Testing
      - Loading Metrics
      - Rendering Speed
- Documentation
  - Style Guide
    - Usage Examples
      - Common Cases
      - Edge Cases
    - Implementation
      - Code Snippets
      - Best Practices
  - Maintenance
    - Version Control
      - Change Tracking
      - Update Process
    - Quality Checks
      - Automated Tests
      - Manual Review

## Components
### Basic Elements
#### Interactive Components
- Buttons
  - Primary Actions
    - Default State
      - Visual Style
      - Size Options
    - Hover State
      - Animation
      - Feedback
    - Active State
      - Press Effect
      - Color Change
  - Secondary Actions
    - Ghost Buttons
      - Border Style
      - Background
    - Text Buttons
      - Typography
      - Spacing
  - State Management
    - Loading State
      - Spinner Design
      - Disabled Input
    - Disabled State
      - Visual Cues
      - Interaction Block
- Links
  - Text Links
    - Inline Style
      - Underline Rules
      - Color System
    - Block Links
      - Card Links
      - Navigation Items
  - Interactive States
    - Hover Effects
      - Color Change
      - Animation
    - Focus States
      - Outline Style
      - Keyboard Nav

#### Form Elements
- Input Fields
  - Text Inputs
    - Basic Input
      - Border Style
      - Padding Rules
    - Textarea
      - Resize Behavior
      - Height Limits
    - Search Input
      - Icon Position
      - Clear Button
  - Select Inputs
    - Dropdown Style
      - Arrow Design
      - Option List
    - Multi-select
      - Tag Design
      - Clear All
  - Specialized Inputs
    - Date Picker
      - Calendar UI
      - Format Options
    - Number Input
      - Increment Controls
      - Range Limits
- Validation
  - Error States
    - Visual Indicators
      - Border Color
      - Icon Usage
    - Error Messages
      - Position Rules
      - Animation
  - Success States
    - Confirmation
      - Check Mark
      - Message Style
    - Data Format
      - Validation Rules
      - Format Display

### Composite Elements
#### Navigation Systems
- Main Navigation
  - Desktop Menu
    - Horizontal Nav
      - Item Spacing
      - Dropdown Trigger
    - Vertical Nav
      - Collapsible Sections
      - Icon Usage
  - Mobile Menu
    - Hamburger Menu
      - Icon Animation
      - Panel Slide
    - Bottom Navigation
      - Icon Design
      - Label Position
- Secondary Navigation
  - Breadcrumbs
    - Separator Style
      - Icon Choice
      - Spacing Rules
    - Truncation
      - Responsive Rules
      - Tooltip Usage
  - Pagination
    - Number Display
      - Active State
      - Range Limits
    - Navigation Controls
      - Arrow Design
      - Disabled States

#### Content Containers
- Cards
  - Basic Layout
    - Header Design
      - Title Style
      - Action Items
    - Content Area
      - Image Handling
      - Text Flow
  - Interactive States
    - Hover Effect
      - Shadow Change
      - Scale Transform
    - Click Action
      - Feedback
      - Navigation
- Modals
  - Structure
    - Header Section
      - Title Style
      - Close Button
    - Content Area
      - Scroll Behavior
      - Padding Rules
  - Behavior
    - Open Animation
      - Timing
      - Effect Style
    - Focus Management
      - Trap Focus
      - Return Focus

## Documentation
### Implementation Guide
#### Setup Instructions
- Environment Configuration
  - Tool Requirements
    - Build Process
      - Testing Setup
        - CI/CD Integration
          - Deployment Rules
            - Monitoring Setup
              - Maintenance Guide
                - Troubleshooting Steps
                  - Support Protocols: Establish comprehensive support protocols for implementation issues. Include specific procedures for issue triage, escalation paths, and resolution tracking.

#### API Documentation
- Method Descriptions
  - Parameter Details
    - Return Types
      - Error Handling
        - Example Usage
          - Edge Cases
            - Security Notes
              - Version History
                - Migration Guide
                  - Breaking Changes: Document comprehensive details about breaking changes in the API. Include specific migration steps, code examples, and potential impact analysis for each change.

### Style Guide
#### Component Usage
- Implementation Rules
  - Best Practices
    - Common Patterns
      - Anti-patterns
        - Code Examples
          - Performance Tips
            - Accessibility Guidelines
              - Testing Strategies
                - Documentation Standards
                  - Maintenance Procedures: Define detailed procedures for maintaining component documentation. Include specific requirements for updating examples, validating code snippets, and reviewing documentation accuracy.

#### Content Guidelines
- Voice and Tone
  - Writing Style
    - Terminology Usage
      - Localization Rules
        - Character Limits
          - Content Structure
            - SEO Guidelines
              - Accessibility Writing
                - Review Process
                  - Version Control: Establish comprehensive version control for content guidelines. Include specific procedures for reviewing changes, maintaining consistency, and tracking content versions.

### Design Tokens
#### Token Structure
- Naming Conventions
  - Category Organization
    - Value Formats
      - Platform Support
        - Theme Handling
          - Version Control
            - Build Process
              - Documentation Rules
                - Testing Requirements
                  - Maintenance Strategy: Define detailed strategies for maintaining design tokens. Include specific procedures for updating tokens, validating changes, and ensuring consistency across platforms.

#### Token Implementation
- Framework Integration
  - Build Tools
    - Platform Support
      - Theme Generation
        - Version Management
          - Testing Protocols
            - Documentation Rules
              - Migration Guides
                - Performance Impact
                  - Maintenance Procedures: Establish comprehensive procedures for maintaining token implementations. Include specific requirements for testing, validation, and documentation of token changes.

## Maintenance
### Version Control
#### Release Strategy
- Semantic Versioning
  - Change Documentation
    - Migration Planning
      - Testing Protocol
        - Rollback Process
          - Monitoring Plan
            - Support Strategy
              - Update Protocol
                - Security Checks
                  - Performance Tests: Implement comprehensive performance testing for each release. Include specific metrics for load time, runtime performance, and resource usage across different environments and conditions.

#### Change Management
- Impact Analysis
  - Review Process
    - Approval Workflow
      - Documentation Updates
        - Testing Requirements
          - Release Planning
            - Communication Strategy
              - Training Materials
                - Monitoring Plan
                  - Rollback Procedures: Establish detailed procedures for rolling back changes when necessary. Include specific steps for identifying rollback triggers, executing the rollback, and managing affected systems.

### Quality Assurance
#### Testing Strategy
- Unit Testing
  - Integration Testing
    - End-to-End Testing
      - Performance Testing
        - Accessibility Testing
          - Security Testing
            - Compatibility Testing
              - Documentation Testing
                - Automation Strategy
                  - Reporting Systems: Implement comprehensive testing report generation and analysis. Include specific metrics for test coverage, failure rates, and performance benchmarks across different test types.

#### Monitoring Systems
- Performance Metrics
  - Error Tracking
    - Usage Analytics
      - Security Monitoring
        - Accessibility Compliance
          - Browser Compatibility
            - Mobile Performance
              - Server Metrics
                - User Feedback
                  - Improvement Planning: Establish detailed procedures for analyzing monitoring data and planning improvements. Include specific methods for identifying trends, prioritizing issues, and implementing solutions.

### Security
#### Authentication Systems
- Access Control
  - Permission Management
    - Security Protocols
      - Encryption Standards
        - Audit Logging
          - Threat Detection
            - Incident Response
              - Recovery Procedures
                - Documentation Requirements
                  - Compliance Monitoring: Implement comprehensive security compliance monitoring. Include specific checks for regulatory requirements, security standards, and internal policies.

#### Data Protection
- Encryption Methods
  - Storage Security
    - Transfer Protocols
      - Access Controls
        - Backup Systems
          - Recovery Plans
            - Audit Procedures
              - Compliance Requirements
                - Documentation Standards
                  - Training Programs: Establish detailed security training programs for team members. Include specific modules for different security aspects, testing procedures, and certification requirements.

## Maintenance
### Version Control
#### Release Strategy
##### Semantic Versioning
###### Change Documentation
####### Migration Planning
######## Testing Protocol
######### Rollback Process
########## Monitoring Plan
########### Support Strategy
############ Update Protocol
############# Security Checks
############## Performance Tests

### Quality Assurance
#### Testing Strategy
##### Unit Tests
###### Integration Tests
####### E2E Testing
######## Performance Tests
######### Accessibility Tests
########## Security Audits
########### Compliance Checks
############ Documentation Tests
############# Automation Rules
############## Reporting Systems`;

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
