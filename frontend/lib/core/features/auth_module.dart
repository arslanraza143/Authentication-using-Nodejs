import 'dart:convert';

import 'package:http/http.dart' as http;

class API {
  final basePath = 'http://192.168.18.124:3000';

  Future<Map> createUser(Map data) async {
    final url = Uri.parse('$basePath/create');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data;
      } else {
        return {'error': 'something not good'};
      }
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  Future<Map> login(Map data) async {
    final url = Uri.parse('$basePath/logout');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: data,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        print(data);
        return data;
      } else {
        return {'error': 'something not good'};
      }
    } catch (e) {
      return {'error': e};
    }
  }
}
