import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { HStack, Text } from '@gluestack-ui/themed';

export default function CategoryList({ categories = [], selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
      <HStack space="md">
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 16,
              backgroundColor: selected?.id === cat.id ? '#1976d2' : '#eee',
              marginRight: 8,
            }}
          >
            <Text color={selected?.id === cat.id ? '#fff' : '#333'}>{cat.name}</Text>
          </Pressable>
        ))}
      </HStack>
    </ScrollView>
  );
}
