import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { createList, getUserLists } from "../../services/lists";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function ListsScreen() {
  const router = useRouter();
  const [lists, setLists] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const loadLists = async () => {
    const data = await getUserLists();
    setLists(data);
  };

  useEffect(() => {
    loadLists();
  }, []);

  const handleCreate = async () => {
    await createList(title, desc, isPublic);
    setModalVisible(false);
    setTitle("");
    setDesc("");
    loadLists();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Lists</Text>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/list/${item.id}`)
            }
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={["#1e1e1e", "#111"]}
              style={styles.card}
            >
              <Text style={styles.listTitle}>
                {item.title}
              </Text>
              <Text style={styles.desc}>
                {item.description}
              </Text>

              <Text style={styles.meta}>
                {item.isPublic
                  ? "🌍 Public"
                  : "🔒 Private"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />

      {/* CREATE BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "#fff", fontSize: 24 }}>
          +
        </Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Create New List
            </Text>

            <TextInput
              placeholder="List Name"
              placeholderTextColor="#888"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              placeholder="Description"
              placeholderTextColor="#888"
              style={styles.input}
              value={desc}
              onChangeText={setDesc}
            />

            <View style={styles.switchRow}>
              <Text style={{ color: "#fff" }}>
                Public
              </Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
              />
            </View>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleCreate}
            >
              <Text style={{ color: "#fff" }}>
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cardWrapper: {
    marginBottom: 15,
  },
  card: {
    padding: 20,
    borderRadius: 20,
  },
  listTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  desc: {
    color: "#aaa",
    marginTop: 6,
  },
  meta: {
    color: "#e50914",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 25,
    bottom: 40,
    backgroundColor: "#e50914",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalBox: {
    backgroundColor: "#111",
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 12,
    color: "#fff",
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  createBtn: {
    backgroundColor: "#e50914",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
