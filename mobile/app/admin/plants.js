import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import plantService from '../../src/services/plantService';

const EMPTY = { category_id: '', common_name: '', scientific_name: '', botanical_family: '', description: '', plant_image: '', care_requirements: { light: '', water: '', temperature: '', humidity: '' }, common_disease_ids: [], is_published: true };
const FIELD = [
  ['common_name', 'Common name *'], ['scientific_name', 'Scientific name *'],
  ['botanical_family', 'Botanical family'], ['plant_image', 'Image URL'],
  ['description', 'Description'],
];
const CARE_FIELDS = [
  ['light', 'Light', 'e.g. Bright indirect light'],
  ['water', 'Water', 'e.g. 2–3 times per week'],
  ['temperature', 'Temperature', 'e.g. 20–35°C'],
  ['humidity', 'Humidity', 'e.g. Medium'],
];

export default function ManagerPlantsScreen() {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      const [plantResponse, categoryResponse] = await Promise.all([
        plantService.getManagerPlants({ search, limit: 100 }), plantService.getCategories(),
      ]);
      setPlants(plantResponse.data?.plants || []);
      setCategories(categoryResponse.data || []);
    } catch (error) {
      Alert.alert('Could not load plants', error.response?.data?.message || 'Check your connection and try again.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, category_id: categories[0]?._id || '' });
    setVisible(true);
  };

  const openEdit = (plant) => {
    setEditing(plant);
    setForm({ ...EMPTY, ...plant, category_id: plant.category_id?._id || plant.category_id || '', care_requirements: { ...EMPTY.care_requirements, ...(plant.care_requirements || {}) }, common_disease_ids: (plant.common_disease_ids || []).join('\n') });
    setVisible(true);
  };

  const save = async () => {
    if (!form.common_name.trim() || !form.scientific_name.trim() || !form.category_id) {
      Alert.alert('Missing information', 'Name and category are required.'); return;
    }
    const careRequirements = Object.fromEntries(Object.entries(form.care_requirements).filter(([, value]) => value.trim()));
    const diseaseIds = form.common_disease_ids.split(/[,\n]/).map((id) => id.trim()).filter(Boolean);
    const payload = { category_id: form.category_id, common_name: form.common_name.trim(), scientific_name: form.scientific_name.trim(), botanical_family: form.botanical_family, description: form.description, plant_image: form.plant_image, care_requirements: careRequirements, common_disease_ids: diseaseIds, is_published: form.is_published };
    try {
      setSaving(true);
      if (editing) await plantService.updatePlant(editing._id, payload); else await plantService.createPlant(payload);
      setVisible(false); await load(true);
    } catch (error) { Alert.alert('Could not save plant', error.response?.data?.message || 'Please check the form and try again.'); }
    finally { setSaving(false); }
  };

  const remove = (plant) => Alert.alert('Delete plant?', `Delete ${plant.common_name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await plantService.deletePlant(plant._id); await load(true); }
      catch (error) { Alert.alert('Could not delete plant', error.response?.data?.message || 'Please try again.'); }
    } },
  ]);

  const renderPlant = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.leafIcon}><Ionicons name="leaf" size={21} color="#28744C" /></View>
        <View style={styles.plantInfo}>
          <Text style={styles.commonName}>{item.common_name}</Text>
          <Text style={styles.scientificName}>{item.scientific_name}</Text>
          <Text style={styles.meta}>{item.botanical_family || 'Family not specified'} · {item.category_id?.category_name || 'No category'}</Text>
        </View>
        <View style={[styles.badge, item.is_published ? styles.published : styles.draft]}><Text style={[styles.badgeText, !item.is_published && styles.draftText]}>{item.is_published ? 'Published' : 'Draft'}</Text></View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}><Ionicons name="create-outline" size={16} color="#144D37" /><Text style={styles.editText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => remove(item)}><Ionicons name="trash-outline" size={16} color="#BF4141" /><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><View><Text style={styles.eyebrow}>MANAGEMENT</Text><Text style={styles.title}>Plants</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{plants.length}</Text></View></View>
      <Text style={styles.subtitle}>Manage your botanical directory</Text>
      <View style={styles.searchBox}><Ionicons name="search-outline" size={19} color="#849087" /><TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search plants..." placeholderTextColor="#9AA39C" /></View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#144D37" /></View> : <FlatList data={plants} keyExtractor={(item) => item._id} renderItem={renderPlant} contentContainerStyle={[styles.list, plants.length === 0 && styles.emptyList]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#144D37" />} ListEmptyComponent={<View style={styles.center}><Ionicons name="leaf-outline" size={40} color="#AAB6AC" /><Text style={styles.emptyTitle}>No plants yet</Text><Text style={styles.emptySubtitle}>Add your first botanical species.</Text></View>} />}
      <TouchableOpacity style={styles.addButton} onPress={openCreate}><Ionicons name="add" size={21} color="#FFFFFF" /><Text style={styles.addText}>Add new plant</Text></TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView style={styles.modalSafe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalHeader}><TouchableOpacity onPress={() => setVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><Text style={styles.modalTitle}>{editing ? 'Edit plant' : 'New plant'}</Text><TouchableOpacity onPress={save} disabled={saving}><Text style={[styles.saveText, saving && { opacity: 0.5 }]}>{saving ? 'Saving…' : 'Save'}</Text></TouchableOpacity></View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
              <Text style={styles.fieldLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => <TouchableOpacity key={category._id} style={[styles.categoryChip, form.category_id === category._id && styles.categoryChipActive]} onPress={() => setForm({ ...form, category_id: category._id })}><Text style={[styles.categoryChipText, form.category_id === category._id && styles.categoryChipTextActive]}>{category.category_name}</Text></TouchableOpacity>)}
              </ScrollView>
              {!categories.length && <Text style={styles.noCategories}>Create a plant category before adding plants.</Text>}
              {FIELD.map(([key, label]) => <View key={key} style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={form[key] == null ? '' : String(form[key])} onChangeText={(value) => setForm({ ...form, [key]: value })} placeholder={label} placeholderTextColor="#9AA39C" multiline={key === 'description'} numberOfLines={key === 'description' ? 4 : 1} autoCapitalize="none" style={[styles.input, key === 'description' && styles.multilineInput]} /></View>)}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Care requirements</Text>
                <Text style={styles.fieldHint}>Add care information for this plant.</Text>
                <View style={styles.careCard}>
                  {CARE_FIELDS.map(([key, label, placeholder], index) => (
                    <View key={key} style={[styles.careRow, index === CARE_FIELDS.length - 1 && styles.careRowLast]}>
                      <View style={styles.careLabel}><Ionicons name={key === 'light' ? 'sunny-outline' : key === 'water' ? 'water-outline' : key === 'temperature' ? 'thermometer-outline' : 'cloud-outline'} size={17} color="#548165" /><Text style={styles.careLabelText}>{label}</Text></View>
                      <TextInput value={form.care_requirements[key] || ''} onChangeText={(value) => setForm({ ...form, care_requirements: { ...form.care_requirements, [key]: value } })} placeholder={placeholder} placeholderTextColor="#A0AAA2" style={styles.careInput} />
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Disease IDs</Text>
                <Text style={styles.fieldHint}>Enter one disease ID per line, or separate IDs with commas.</Text>
                <TextInput value={form.common_disease_ids} onChangeText={(value) => setForm({ ...form, common_disease_ids: value })} placeholder="Paste disease IDs here" placeholderTextColor="#9AA39C" multiline autoCapitalize="none" style={[styles.input, styles.multilineInput]} />
              </View>
              <View style={styles.publishRow}><View><Text style={styles.fieldLabel}>Published</Text><Text style={styles.publishHint}>Show this plant in the public directory</Text></View><Switch value={!!form.is_published} onValueChange={(value) => setForm({ ...form, is_published: value })} trackColor={{ true: '#247855' }} /></View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' }, header: { paddingHorizontal: 21, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { color: '#7D8B80', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, title: { color: '#183B2B', fontSize: 29, fontWeight: '800', marginTop: 3 }, subtitle: { color: '#748078', fontSize: 13, paddingHorizontal: 21, marginTop: 5, marginBottom: 17 }, countBadge: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#E7F3EA', alignItems: 'center', justifyContent: 'center' }, countText: { color: '#28744C', fontSize: 15, fontWeight: '800' }, searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6EBE6', borderRadius: 13, paddingHorizontal: 13, height: 46, marginBottom: 15 }, searchInput: { flex: 1, color: '#26362B', fontSize: 14, marginLeft: 9 }, list: { paddingHorizontal: 18, paddingBottom: 16, gap: 12 }, emptyList: { flexGrow: 1 }, card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5EBE5', borderRadius: 15, padding: 13 }, cardTop: { flexDirection: 'row', alignItems: 'center' }, leafIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: '#EDF7F1', justifyContent: 'center', alignItems: 'center' }, plantInfo: { flex: 1, paddingHorizontal: 11 }, commonName: { color: '#26372B', fontSize: 15, fontWeight: '700' }, scientificName: { color: '#68776D', fontSize: 12, fontStyle: 'italic', marginTop: 2 }, meta: { color: '#8A958D', fontSize: 10, marginTop: 4 }, badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4 }, published: { backgroundColor: '#E8F5EB' }, draft: { backgroundColor: '#F0F0EF' }, badgeText: { color: '#328052', textTransform: 'uppercase', fontSize: 8, fontWeight: '800' }, draftText: { color: '#737A74' }, cardActions: { flexDirection: 'row', borderTopColor: '#EEF1EE', borderTopWidth: 1, marginTop: 13, paddingTop: 11, gap: 9 }, editButton: { flex: 1, height: 36, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CBD8CC', borderRadius: 9 }, editText: { color: '#144D37', fontWeight: '700', fontSize: 12 }, deleteButton: { height: 36, minWidth: 85, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2F1', borderRadius: 9 }, deleteText: { color: '#BF4141', fontWeight: '700', fontSize: 12 }, addButton: { marginHorizontal: 18, marginTop: 6, marginBottom: 10, backgroundColor: '#144D37', height: 50, borderRadius: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }, addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, emptyTitle: { color: '#26372B', fontSize: 17, fontWeight: '700', marginTop: 12 }, emptySubtitle: { color: '#849087', fontSize: 13, marginTop: 5 }, modalSafe: { flex: 1, backgroundColor: '#F9FAF9' }, modalHeader: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8ECE9' }, modalTitle: { color: '#183B2B', fontSize: 16, fontWeight: '800' }, cancelText: { color: '#748078', fontSize: 14 }, saveText: { color: '#144D37', fontSize: 14, fontWeight: '800' }, form: { padding: 19, paddingBottom: 45 }, field: { marginBottom: 15 }, fieldLabel: { color: '#425047', fontSize: 12, fontWeight: '700', marginBottom: 7 }, fieldHint: { color: '#8A958D', fontSize: 11, marginTop: -3, marginBottom: 8, lineHeight: 16 }, input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DEE6DF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: '#26372B', fontSize: 14, minHeight: 44, textAlignVertical: 'top' }, multilineInput: { minHeight: 78 }, careCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DEE6DF', borderRadius: 12, paddingHorizontal: 12 }, careRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEF1EE' }, careRowLast: { borderBottomWidth: 0 }, careLabel: { width: 104, flexDirection: 'row', alignItems: 'center', gap: 7 }, careLabelText: { color: '#425047', fontSize: 12, fontWeight: '600' }, careInput: { flex: 1, minHeight: 42, color: '#26372B', fontSize: 12 }, categoryScroll: { flexGrow: 0, marginBottom: 19 }, categoryChip: { borderWidth: 1, borderColor: '#DCE4DD', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8, marginRight: 8, backgroundColor: '#FFFFFF' }, categoryChipActive: { backgroundColor: '#144D37', borderColor: '#144D37' }, categoryChipText: { color: '#607066', fontSize: 12 }, categoryChipTextActive: { color: '#FFFFFF', fontWeight: '700' }, noCategories: { color: '#BF4141', fontSize: 12, marginTop: -12, marginBottom: 18 }, publishRow: { borderTopWidth: 1, borderTopColor: '#E8ECE9', marginTop: 4, paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, publishHint: { color: '#849087', fontSize: 11, marginTop: -3 },
});
