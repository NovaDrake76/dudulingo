
import Card from "@/components/card/index";
import { useState } from "react";
import { Button, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const [stage, setStage] = useState(0);
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
     <Card />

     {
      stage === 0 ? (
        <View>
          <Button title="Dog" onPress={() => setStage(1)} />
        </View>
      )  : stage === 1 ? (
        <View style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {
            ["Cat", "Bird", "Dog","Fish"].map((item) => (
              <Button key={item} title={item} onPress={() => setStage(2)} />
            ))
          }
          </View>
      ) : (
        <View>
          <TextInput placeholder="Type your answer" style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, width: '100%', marginBottom: 10 }} />
          </View>
      )

     }
  </View>;
}

