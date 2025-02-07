import { CodingQuestion } from "@/types/questions";

export const complexQuestions: CodingQuestion[] = [
  {
    id: "1",
    title: "Distributed Rate Limiter with Consensus",
    description: `Design a distributed rate limiter using the Raft consensus algorithm that:
    
1. Implements a token bucket algorithm with dynamic token generation rates
2. Handles network partitions and leader election
3. Maintains consistency across multiple data centers
4. Provides real-time analytics on rate limit violations
5. Supports different rate limits for different API endpoints/users
6. Handles clock skew between nodes using vector clocks
7. Implements automatic failover and recovery
8. Uses Redis for distributed state management

Your solution must handle edge cases like:
- Network partitions during leader election
- Split-brain scenarios
- Data center outages
- Clock drift between nodes
- High concurrency scenarios`,
    difficulty: "Expert",
    timeLimit: 3600,
    testCases: [
      {
        input: `{
  "requests": [
    {"timestamp": 1645084800, "userId": "user1", "endpoint": "/api/search"},
    {"timestamp": 1645084801, "userId": "user1", "endpoint": "/api/search"},
    {"timestamp": 1645084802, "userId": "user2", "endpoint": "/api/write"}
  ],
  "rateLimits": {
    "/api/search": {"requests": 2, "window": "1s"},
    "/api/write": {"requests": 1, "window": "1s"}
  }
}`,
        expectedOutput: `{
  "allowed": [true, true, true],
  "retryAfter": [null, null, null],
  "leaderNode": "node-1",
  "vectorClock": {"node-1": 3, "node-2": 2, "node-3": 2}
}`
      }
    ],
    constraints: [
      "Leader election must complete within 500ms",
      "State replication lag < 100ms",
      "99.99% availability during network partitions",
      "Support for 1M+ requests/second/node"
    ],
    examples: [
      {
        input: "Concurrent requests during leader election",
        output: "Requests queued and processed after new leader elected",
        explanation: "System maintains consistency during leadership changes"
      }
    ]
  },
  {
    id: "2",
    title: "Real-time Analytics Pipeline",
    description: `Design a real-time analytics pipeline that processes millions of events per second with:

1. Sub-second end-to-end latency
2. Exactly-once processing semantics
3. Automatic scaling and fault tolerance
4. Complex event processing (CEP) capabilities
5. Dynamic query optimization
6. Real-time aggregations with sliding windows
7. Backpressure handling
8. Hot partition mitigation

The system should support:
- Multiple data sources with different schemas
- Dynamic pipeline reconfiguration
- Real-time anomaly detection
- Stateful stream processing
- Custom windowing operations`,
    difficulty: "Expert",
    timeLimit: 3600,
    testCases: [
      {
        input: `{
  "events": [
    {"type": "purchase", "amount": 100, "userId": "user1", "timestamp": 1645084800},
    {"type": "view", "productId": "prod1", "userId": "user1", "timestamp": 1645084801},
    {"type": "purchase", "amount": 200, "userId": "user2", "timestamp": 1645084802}
  ],
  "window": "5s",
  "aggregations": ["sum", "count", "average"]
}`,
        expectedOutput: `{
  "windows": [{
    "start": 1645084800,
    "end": 1645084805,
    "metrics": {
      "purchase_sum": 300,
      "purchase_count": 2,
      "purchase_avg": 150,
      "view_count": 1
    }
  }],
  "latency": "10ms",
  "backpressure": false
}`
      }
    ],
    constraints: [
      "End-to-end latency < 100ms",
      "Memory usage < 2GB per node",
      "Zero data loss guarantee",
      "Support for 1M+ events/second"
    ],
    examples: [
      {
        input: "Sudden spike in event rate",
        output: "Automatic scaling triggers, backpressure applied",
        explanation: "System maintains performance under load"
      }
    ]
  },
  {
    id: "3",
    title: "Distributed Graph Processing Engine",
    description: `Implement a distributed graph processing engine that can:

1. Process billion-node graphs efficiently
2. Support both batch and streaming updates
3. Implement custom graph algorithms
4. Provide real-time query capabilities
5. Handle graph partitioning dynamically
6. Support temporal graph analysis
7. Implement efficient graph traversal
8. Handle graph mutations

Required features:
- Custom graph algorithm framework
- Distributed graph partitioning
- Real-time graph analytics
- Temporal graph analysis
- Efficient graph storage format`,
    difficulty: "Expert",
    timeLimit: 3600,
    testCases: [
      {
        input: `{
  "graph": {
    "nodes": ["A", "B", "C", "D"],
    "edges": [
      {"from": "A", "to": "B", "weight": 1, "timestamp": 1645084800},
      {"from": "B", "to": "C", "weight": 2, "timestamp": 1645084801},
      {"from": "C", "to": "D", "weight": 3, "timestamp": 1645084802}
    ]
  },
  "algorithm": "pagerank",
  "parameters": {
    "dampingFactor": 0.85,
    "iterations": 20
  }
}`,
        expectedOutput: `{
  "results": {
    "A": 0.15,
    "B": 0.32,
    "C": 0.28,
    "D": 0.25
  },
  "convergence": true,
  "iterations": 15,
  "partitionBalance": 0.95
}`
      }
    ],
    constraints: [
      "Support for 1B+ nodes and 10B+ edges",
      "Query latency < 100ms for local queries",
      "Linear scaling with number of nodes",
      "Support for 100K+ concurrent users"
    ],
    examples: [
      {
        input: "PageRank calculation on 1M node graph",
        output: "Distributed computation completes in 30 seconds",
        explanation: "Algorithm efficiently parallelized across cluster"
      }
    ]
  }
];

export const validateQuestionSubmission = async (
  questionId: string,
  code: string
): Promise<boolean> => {
  // This would integrate with your existing Gemini evaluation
  // For now, returning true to allow development
  return true;
};