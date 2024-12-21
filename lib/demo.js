



<div>
<label className="block text-lg font-semibold mb-2">Color Pallete</label>
<input
  type="text"
  value={formData.colors}
  onChange={(e) => setFormData({...formData,colors:e.target.value})}
  placeholder="Your color palette for website"
  className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
  required
/>
</div>