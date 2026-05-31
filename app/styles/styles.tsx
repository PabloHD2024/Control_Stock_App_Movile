import React from 'react';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Estilos para create_Equipment.tsx
    container_C_E: { flex: 1, backgroundColor: '#fff' },
    title_C_E: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    label_C_E: { fontSize: 14, fontWeight: '500', color: '#495057', marginTop: 12, marginBottom: 4 },
    input_C_E: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 12, fontSize: 16 },
    btn_C_E: { backgroundColor: '#28a745', borderRadius: 6, padding: 14, alignItems: 'center', marginTop: 30 },
    btnText_C_E: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Estilos para details.tsx
    container_D_S: { flex: 1, backgroundColor: '#fff' },
    center_D_S: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    roleNotice_D_S: { fontSize: 14, fontWeight: 'bold', color: '#6c757d', marginBottom: 15 },
    label_D_S: { fontSize: 14, fontWeight: '500', color: '#7e7e7e', marginTop: 12, marginBottom: 4 },
    input_D_S: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 10, fontSize: 16 },
    disabled_D_S: { backgroundColor: '#e9ecef', color: '#6c757d' },
    separator_D_S: { height: 1, backgroundColor: '#dee2e6', marginVertical: 20 },
    saveBtn_D_S: { backgroundColor: '#007bff', borderRadius: 6, padding: 14, alignItems: 'center', marginTop: 20 },
    saveText_D_S: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Estilos para index.tsx
    container_Index: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' },
    text_Index: { marginTop: 10, color: '#6c757d', fontSize: 14 },

    //Estilos para login.tsx
    container_login: { flex: 1, justifyContent: 'center', backgroundColor: '#f8f9fa' },
    logo: { fontSize: 35, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#0c2b8f' },
    inputContainer_login: { marginBottom: 16, paddingHorizontal: 20 },
    label_login: { fontSize: 15, fontWeight: '700', color: '#0c2b8f', padding: 5},
    input_login: { backgroundColor: '#fff', padding: 12, fontSize: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ced4da', color: '#a7a7a7' },
    button_login: { backgroundColor: '#007bff', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10, marginHorizontal: 20 },
    buttonText_login: { color: '#fff', fontSize: 16, fontWeight: '600' },
    containerBackground_login: { flex: 1, justifyContent: 'center', width: '100%', height: '100%' },

    //Estilos para tab/admin.tsx
    background_tab_admin: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
    sectionTitle_tab_admin: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    label_tab_admin: { fontSize: 14, marginBottom: 4, fontWeight: '500' },
    input_tab_admin: { backgroundColor: '#fff', padding: 12, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, marginBottom: 14, color: '#a7a7a7' },
    btn_tab_admin: { backgroundColor: '#28a745', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnText_tab_admin: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Estilos para tab/index.tsx
    container_tab_index: { flex: 1 },
    center_tab_index: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    overlay_tab_index: { flex: 1, backgroundColor: 'transparent', padding: 20, justifyContent: 'space-between' },
    permisos_tab_index: {marginBottom: 16, textAlign: 'center'},
    scanText_tab_index: { color: '#fff', fontSize: 16, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8, marginTop: 20 },

    // Estilos tab/movimientos.tsx
    container_tab_movimientos: { flex: 1, backgroundColor: '#f4f6f9', paddingHorizontal: 15, paddingTop: 20 },
    title_tab_movimientos: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    center_tab_movimientos: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty_tab_movimientos: { textAlign: 'center', color: '#6c757d', marginTop: 30, fontSize: 16 },
    card_tab_movimientos: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e3e6ec' },
    cardHeader_tab_movimientos: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    serie_tab_movimientos: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
    date_tab_movimientos: { fontSize: 12, color: '#6c757d' },
    model_tab_movimientos: { fontSize: 14, color: '#495057', marginBottom: 8 },
    detailsRow_tab_movimientos: { borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 8, marginTop: 4 },
    detailText_tab_movimientos: { fontSize: 13, color: '#212529', marginBottom: 2 },

    // Estilos para tab/usuarios.tsx
    container_tab_usuarios: { flex: 1, backgroundColor: '#f4f6f9', padding: 20 },
    title_tab_usuarios: { fontSize: 22, fontWeight: 'bold', color: '#007bff' },
    subtitle_tab_usuarios: { fontSize: 13, color: '#6c757d', marginBottom: 20, marginTop: 4 },
    center_tab_usuarios: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    deniedText_tab_usuarios: { fontSize: 20, fontWeight: 'bold', color: '#dc3545', marginBottom: 8 },
    deniedSub_tab_usuarios: { fontSize: 14, color: '#6c757d', textAlign: 'center' },
    formCard_tab_usuarios: { backgroundColor: '#fff', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#e3e6ec' },
    label_tab_usuarios: { fontSize: 14, fontWeight: '500', color: '#495057', marginTop: 10, marginBottom: 6 },
    input_tab_usuarios: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 12, fontSize: 16, color: '#a7a7a7' },
    roleContainer_tab_usuarios: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 15 },
    roleBtn_tab_usuarios: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#ced4da', alignItems: 'center', borderRadius: 6, marginRight: 5, backgroundColor: '#f8f9fa' },
    activeRole_tab_usuarios: { backgroundColor: '#007bff', borderColor: '#007bff' },
    roleBtnText_tab_usuarios: { fontSize: 14, color: '#495057', fontWeight: '500' },
    activeRoleText_tab_usuarios: { color: '#fff', fontWeight: 'bold' },
    saveBtn_tab_usuarios: { backgroundColor: '#007bff', borderRadius: 6, padding: 14, alignItems: 'center', marginTop: 15 },
    saveText_tab_usuarios: { color: '#fff', fontSize: 16, fontWeight: '600' }

});

export default styles;