
import Card from "@/components/card";
import { useState } from "react";
import { Button, TextInput } from 'react-native';

export default function HomeScreen() {
  const [stage, setStage] = useState(0);
  return <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, maxWidth: 400, margin: '0 auto' }}>
     <Card />

     {
      stage === 0 ? (
        <div>
          <Button title="Dog" onPress={() => setStage(1)} />
          </div>
      )  : stage === 1 ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {
            ["Cat", "Bird", "Dog","Fish"].map((item) => (
              <Button key={item} title={item} onPress={() => setStage(2)} />
            ))
          }
          </div>
      ) : (
        <div>
          <TextInput placeholder="Type your answer" style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, width: '100%', marginBottom: 10 }} />
          </div>
      )

     }
  </div>;
}

