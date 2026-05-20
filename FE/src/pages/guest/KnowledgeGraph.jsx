import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Network,
  Leaf,
  Bug,
  Droplets,
  Sun,
  FlaskConical,
  Zap,
  GitBranch
} from "lucide-react";
import { motion } from "motion/react";

const nodeTypes = [
  { type: "Cây cảnh", icon: Leaf, color: "bg-green-500", count: 1247 },
  { type: "Bệnh", icon: Bug, color: "bg-red-500", count: 89 },
  { type: "Nước", icon: Droplets, color: "bg-blue-500", count: 12 },
  { type: "Ánh sáng", icon: Sun, color: "bg-yellow-500", count: 8 },
  { type: "Đất", icon: FlaskConical, color: "bg-amber-700", count: 24 },
  { type: "Phân bón", icon: Zap, color: "bg-purple-500", count: 35 }
];

const relationships = [
  {
    from: "Monstera Deliciosa",
    to: "Lá vàng",
    type: "BỊ_BỆNH",
    strength: 0.85
  },
  {
    from: "Monstera Deliciosa",
    to: "Tưới vừa phải",
    type: "CẦN",
    strength: 0.92
  },
  {
    from: "Lá vàng",
    to: "Thiếu Nitrogen",
    type: "NGUYÊN_NHÂN",
    strength: 0.78
  },
  {
    from: "Monstera Deliciosa",
    to: "Bóng râm",
    type: "YÊU_CẦU",
    strength: 0.88
  },
  {
    from: "Sen Đá",
    to: "Nhiều ánh sáng",
    type: "YÊU_CẦU",
    strength: 0.95
  },
  {
    from: "Sen Đá",
    to: "Tưới ít",
    type: "CẦN",
    strength: 0.98
  }
];

const exampleQueries = [
  {
    query: "Cây nào chịu bóng và dễ chăm sóc?",
    cypher: "MATCH (p:Plant)-[:REQUIRES]->(l:Light {level: 'low'})\nWHERE p.difficulty = 'easy'\nRETURN p"
  },
  {
    query: "Bệnh lá vàng có thể do nguyên nhân gì?",
    cypher: "MATCH (d:Disease {name: 'Lá vàng'})-[:CAUSED_BY]->(c:Cause)\nRETURN c"
  },
  {
    query: "Monstera cần điều kiện chăm sóc gì?",
    cypher: "MATCH (p:Plant {name: 'Monstera'})-[r]->(req)\nRETURN req, type(r)"
  }
];

function KnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Network className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Neo4j</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Đồ thị tri thức cây cảnh</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Khám phá mối quan hệ phức tạp giữa cây cảnh, bệnh, điều kiện môi trường và cách chăm sóc thông qua đồ thị kiến thức
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {nodeTypes.map((node, index) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 rounded-full ${node.color} flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{node.type}</p>
                    <p className="text-2xl font-bold">{node.count}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="visual">
              <Network className="w-4 h-4 mr-2" />
              Trực quan hóa
            </TabsTrigger>
            <TabsTrigger value="relationships">
              <GitBranch className="w-4 h-4 mr-2" />
              Mối quan hệ
            </TabsTrigger>
            <TabsTrigger value="queries">
              <FlaskConical className="w-4 h-4 mr-2" />
              Truy vấn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-12">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 via-green-600/5 to-blue-500/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0">
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl">
                        <Leaf className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-center mt-2 font-semibold">Monstera</p>
                    </motion.div>

                    {[
                      { icon: Bug, color: "bg-red-500", label: "Lá vàng", x: "20%", y: "20%" },
                      { icon: Droplets, color: "bg-blue-500", label: "Tưới vừa", x: "75%", y: "25%" },
                      { icon: Sun, color: "bg-yellow-500", label: "Bóng râm", x: "80%", y: "70%" },
                      { icon: FlaskConical, color: "bg-amber-700", label: "Đất tơi", x: "15%", y: "75%" }
                    ].map((node, i) => {
                      const Icon = node.icon;
                      return (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{ left: node.x, top: node.y }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.2 }}
                        >
                          <div
                            className={`w-16 h-16 rounded-full ${node.color} flex items-center justify-center shadow-lg -translate-x-1/2 -translate-y-1/2`}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-xs text-center mt-1 -ml-8">{node.label}</p>
                        </motion.div>
                      );
                    })}

                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1="50%"
                        y1="50%"
                        x2="20%"
                        y2="20%"
                        stroke="rgba(45,106,79,0.3)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      <line
                        x1="50%"
                        y1="50%"
                        x2="75%"
                        y2="25%"
                        stroke="rgba(45,106,79,0.3)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      <line
                        x1="50%"
                        y1="50%"
                        x2="80%"
                        y2="70%"
                        stroke="rgba(45,106,79,0.3)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      <line
                        x1="50%"
                        y1="50%"
                        x2="15%"
                        y2="75%"
                        stroke="rgba(45,106,79,0.3)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-6">
                  Click vào các node để khám phá mối quan hệ chi tiết
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4">
            {relationships.map((rel, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      {rel.from}
                    </Badge>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-primary to-green-600" />
                      <Badge variant="outline" className="whitespace-nowrap">
                        {rel.type}
                      </Badge>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-green-600 to-primary" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {rel.to}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {(rel.strength * 100).toFixed(0)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="queries" className="space-y-6">
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                  Truy vấn mẫu với Cypher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sử dụng ngôn ngữ Cypher để truy vấn đồ thị tri thức Neo4j
                </p>
              </CardContent>
            </Card>

            {exampleQueries.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{example.query}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                    {example.cypher}
                  </pre>
                  <Button className="mt-4" variant="outline">
                    Chạy truy vấn
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Knowledge Graph hoạt động như thế nào?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Thu thập dữ liệu</h3>
                <p className="text-sm text-muted-foreground">
                  Hệ thống thu thập thông tin về cây, bệnh, điều kiện từ nhiều nguồn chuyên môn
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Xây dựng mối quan hệ</h3>
                <p className="text-sm text-muted-foreground">
                  Neo4j lưu trữ các node và relationships, tạo nên đồ thị tri thức phức tạp
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Truy vấn thông minh</h3>
                <p className="text-sm text-muted-foreground">
                  Sử dụng Cypher để tìm kiếm mối liên hệ ẩn và đưa ra gợi ý chăm sóc
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  KnowledgeGraph
};
